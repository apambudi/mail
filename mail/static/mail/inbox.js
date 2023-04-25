document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Submit handler
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send a GET request
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {emails.forEach(email => {
    let element = document.createElement('div');
    element.innerHTML = `${email.sender}, ${email.subject}, ${email.timestamp},`;
    element.style.border = "solid";
    if (email.read == true) {
      element.style.backgroundColor = "gray";
    }
    else {
      element.style.backgroundColor = "white";
    }
    // let id = email.id;
    element.addEventListener('click', () => show_email(email.id, mailbox));
    document.querySelector('#emails-view').append(element);
    })
  });
}

function show_email(id, mailbox) {

  // Show the email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  // GET request for the email content
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    // Add HTML element to display the email content
    let element = document.createElement('p');
    element.innerHTML = `From: ${email.sender}<br>To: ${email.recipients}<br>Subject: ${email.subject}<br>Timestamp: ${email.timestamp}<br>`;
    document.querySelector('#email-view').append(element);

    // Add reply button 
    let reply_element = document.createElement('button');
    reply_element.innerHTML = 'Reply';
    reply_element.addEventListener('click', () => reply_email(email.sender, email.subject, email.timestamp, email.body))
    document.querySelector('#email-view').append(reply_element);

    // Add body
    const body = document.createElement('p');
    body.innerHTML = `<br>${email.body}<br>`;
    document.querySelector('#email-view').append(body);

    // Add button to archive or unarchive the email
    const arc_element = document.createElement('button');
    // Check whether inbox or archive
    if (mailbox == 'inbox') {
      // If it is inbox, name the button as 'Archived', and make request accordingly
      arc_element.innerHTML = 'Archived';
      arc_element.addEventListener('click', () => {
        // PUT request to archive the email
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true,
          })
        });
        // Load the user's inbox 
        load_mailbox('inbox');
      })
    } else if (mailbox == 'archive') {
    // If it is archive, name the button as 'Unarchive', and make request accordingly
    arc_element.innerHTML = 'Unarchive';
    arc_element.addEventListener('click', () => {
      // PUT request to unarchive the email
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false,
        })
      });
      // Load the user's inbox 
      load_mailbox('inbox');
    })
    }
    document.querySelector('#email-view').append(arc_element);
  })

  // Update that an email is read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true,
    })
  })
}

function reply_email(sender, subject, timestamp, body) {
  console.log('this is it')

  // Show the email view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Fill the recipient email
  document.querySelector('#compose-recipients').value = `${sender}`;

  // Fill the subject email
  if (subject.slice(0,3) != 'Re:') {
    document.querySelector('#compose-subject').value = `Re: ${subject}`;
  } else {
    document.querySelector('#compose-subject').value = `${subject}`;
  }

  // Prefill the body of the email
  document.querySelector('#compose-body').innerHTML = `On ${timestamp} ${sender} wrote: ${body}`;
}

function send_email(event) {
  event.preventDefault();

  // Store fields from compose form 
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;

  // Send a POST request to the URL
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    })
  })
  .then(response => response.json().then(result => ({status: response.status, result: result})))
  .then(obj => {
    console.log(obj.status);
    console.log(obj.result);
    if (obj.status == 201) {
      load_mailbox('sent');
    } 
    else {
      let error = obj.result.error;
      alert(`${error}`);
    }
  });
}