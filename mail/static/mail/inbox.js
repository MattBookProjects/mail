document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());
  document.querySelector('#compose-submit').addEventListener('click', () => send_email());
  load_mailbox('inbox');  
  
});

  



function compose_email(preoccupy_data) {

  // Show compose view and hide other views
  
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#compose-error').style.display = 'none';

  // Clear out composition fields
  if( preoccupy_data == null ){
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  } else {
    document.querySelector('#compose-recipients').value = preoccupy_data.recipients;
    document.querySelector('#compose-subject').value = preoccupy_data.subject;
    document.querySelector('#compose-body').value = preoccupy_data.body;
  }
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#mailbox-view').innerHTML = `<div class="page-header">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</div>`;
  
  fetch(`emails/${mailbox}`).then(response => response.json()).then(emails => { 
    emails.forEach(email => {
      const element = document.createElement('div');
      if ( element.classList ){
        element.classList.add('mailbox-item');
      }
      else {
        element.className += 'mailbox-item';
      }
      if ( email.read ){
        element.classList.add('read-email');
      }
      else {
        element.classList.add('unread-email');
      }
      element.innerHTML = `<div class="mailbox-sender">${email.sender}</div><div class="mailbox-subject">${email.subject}</div><div class="mailbox-timestamp">${email.timestamp}</div>`;
      element.addEventListener('click', () => load_email(email.id, mailbox));
      document.querySelector('#mailbox-view').append(element);
  })}); 
} 

function load_email(id, mailbox){
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  fetch(`emails/${id}`).then(response => response.json()).then(email => { 
    document.querySelector('#email-sender').innerHTML = email.sender;
    document.querySelector('#email-recipients').innerHTML = email.recipients;
    document.querySelector('#email-subject').innerHTML = email.subject;
    document.querySelector('#email-body').innerHTML = email.body;
    document.querySelector('#email-timestamp').innerHTML = email.timestamp;
    if (mailbox === 'sent'){
      document.querySelector('#email-controls-container').style.display='none';
    } else {
      document.querySelector('#email-controls-container').style.display = 'block';
      document.querySelector('#email-archive-control').innerHTML = email.archived ? 'Unarchive' : 'Archive';
      document.querySelector('#email-archive-control').onclick = function(){archive_email(email, id);};  
      document.querySelector('#email-reply-control').onclick =  function(){compose_email({subject: `${email.subject.startsWith('Re: ') ? email.subject : 'Re: ' + email.subject}`, recipients: `${email.sender}`, body: `${"On " + email.timestamp + " " + email.sender + " wrote: " + email.body}`});};
    } 
  });
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
} 

async function send_email(){
  if( document.querySelector('#compose-subject').value === '' ){
    document.querySelector('#compose-error').innerHTML = 'Subject can\'t be empty';
    document.querySelector('#compose-error').style.display = 'block';
  } else if( document.querySelector('#compose-body').value === ''){
    document.querySelector('#compose-error').innerHTML = 'Body can\'t be empty';
    document.querySelector('#compose-error').style.display = 'block';
  } else {
      const response = await fetch('emails', {
        method: 'POST',
        body: JSON.stringify({
          subject: document.querySelector('#compose-subject').value,
          body: document.querySelector('#compose-body').value,
          recipients: document.querySelector('#compose-recipients').value
        })
      });
      if( response.status === 400 ){
        const data = await response.json();
        document.querySelector('#compose-error').innerHTML = `${data.error}`;
        document.querySelector('#compose-error').style.display = 'block';
      } else if( response.status === 201 ){
        load_mailbox('sent');
      }
    }
}

function archive_email(email, id){
    fetch(`emails/${id}`, { 
            method: 'PUT',
            body: JSON.stringify({
              archived: !email.archived
            })
          }).then(response => {
            if( response.status === 204 ){
              load_mailbox('inbox');
            }
          });
}