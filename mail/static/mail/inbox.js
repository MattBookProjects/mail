document.addEventListener('DOMContentLoaded', function() {


  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-submit').addEventListener('click', () => {
    alert(`subject: ${document.querySelector('#compose-subject').value}\nbody: ${document.querySelector('#compose-body').value}`);
    fetch('emails', { 
      method: 'POST',
      body: JSON.stringify({ 
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
        recipients: document.querySelector('#compose-recipients').value
      })
    });//.then( localStorage.setItem('page', 'sent'));
  });
  load_mailbox('inbox');
  // By default, load the inbox
//  if ( !localStorage.getItem('page') ) {
  //  load_mailbox('inbox');
 // } else {
   // load_mailbox(`${localStorage.getItem('page')}`);
   // localStorage.removeItem('page');
 // }
});

function compose_email(preoccupy_data={subject: '', recipients: '', body: ''}) {

  // Show compose view and hide other views
  
  document.querySelector('#mailbox-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  
  document.querySelector('#compose-recipients').value = preoccupy_data.recipients;
  document.querySelector('#compose-subject').value = preoccupy_data.subject;
  document.querySelector('#compose-body').value = preoccupy_data.body;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#mailbox-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#mailbox-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`emails/${mailbox}`).then(response => response.json()).then(emails => { emails.forEach(email => {
    const element = document.createElement('div');
    if ( element.classList ){
      element.classList.add('inbox-item');
    }
    else {
      element.className += 'inbox-item';
    }
    if ( email.read ){
      element.classList.add('read-email');
    }
    else {
      element.classList.add('unread-email');
    }
    element.innerHTML = `<div>${email.sender}</div><div>${email.subject}</div><div>${email.timestamp}</div>`;
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
    if (mailbox !== 'sent'){
      const archive_button = document.createElement('button');
      archive_button.innerHTML = email.archived ? 'Unarchive' : 'Archive';
      archive_button.addEventListener('click', () => { 
      
          fetch(`emails/${id}`, { 
            method: 'PUT',
            body: JSON.stringify({
              archived: !email.archived
            })
          }).then(load_mailbox('inbox'));
        }
      );
      document.querySelector('#email-view').append(archive_button);

      const reply_button = document.createElement('button');
      reply_button.innerHTML = 'Reply';
      reply_button.addEventListener('click', () => {
        compose_email({subject: `${"Re: " + email.subject}`, recipients: `${email.sender}`, body: `${"On " + email.timestamp + " " + email.sender + " wrote: " + email.body}`});
       /* document.querySelector('#compose-subject').value = `${"Re: " + email.subject}`;
        document.querySelector('#compose-recipients').value = `${email.sender}`;
        document.querySelector('#compose-body').value = `${"On " + email.timestamp + " " + email.sender + " wrote: " + email.body}`; */
      });
      document.querySelector('#email-view').append(reply_button);
    }
  });
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
} 