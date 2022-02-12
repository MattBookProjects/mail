document.addEventListener('DOMContentLoaded', function() {

  console.log("Dom content loaded");

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
    }).then( localStorage.setItem('page', 'sent'));
  });

  // By default, load the inbox
  if ( !localStorage.getItem('page') ) {
    load_mailbox('inbox');
  } else {
    load_mailbox(`${localStorage.getItem('page')}`);
    localStorage.removeItem('page');
  }
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
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  fetch(`emails/${mailbox}`).then(response => response.json()).then(emails => { emails.forEach(email => {
    const element = document.createElement('div');
    if ( element.classList ){
      element.classList.add('inbox-item');
    }
    else {
      element.className += 'inbox-item';
    }
    element.innerHTML = `<div>${email.sender}</div><div>${email.subject}</div><div>${email.timestamp}</div>`;
    element.addEventListener('click', () => { alert(`${email.body}`);})
    document.querySelector('#emails-view').append(element);
  })});
  // Show the mailbox name
 
    
    //.then(data => {alert(`${data}`);});//(emails => emails.forEach(email => {
   // const element = document.createElement('div');
   // element.innerHTML = `${email.subject}`;
   // document.querySelector('#emails-view').append(element);
    //console.log(`${element.innerHTML}`);

 
}