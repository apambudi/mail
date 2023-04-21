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

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Send a GET request to the URL
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {emails.forEach(email => {
    const element = document.createElement('div');
    element.innerHTML = `${email.sender}, ${email.subject}, ${email.timestamp},`;
    element.style.border = "solid";
    if (email.read == true) {
      element.style.backgroundColor = "gray";
    }
    else {
      element.style.backgroundColor = "white";
    }
    document.querySelector('#emails-view').append(element);
    })
  });
}

function send_email(event) {
  event.preventDefault();

  // Store fields from compose form 
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send a POST request to the URL
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value,
    })
  })
  .then(response => response.json().then(result => ({status: response.status, message: result})))
  .then(obj => {
    console.log(obj.status);
    console.log(obj.message);
    if (obj.status == 201) {
      load_mailbox('sent');
    } 
    else {
      const error = obj.message.error;
      alert(`${error}`);
    }
  });
}