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

  // Send a GET request to the URL
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
    let id = email.id;
    // element.addEventListener('click', show_email);
    element.addEventListener('click', () => show_email(id));
    document.querySelector('#emails-view').append(element);
    })
  });
}

function show_email(id) {

  // Show the email content and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    let element1 = document.createElement('p');
    element1.innerHTML = `From: ${email.sender}<br>To: ${email.recipients}<br>Subject: ${email.subject}<br>Timestamp: ${email.timestamp}<br><br>${email.body}`;
    document.getElementById('email-view').append(element1);
  })

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: true,
    })
  })
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