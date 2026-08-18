function updateTaskerWelcome(){
  const now=new Date();
  const hour=now.getHours();
  let greeting='Dobro veče';
  if(hour>=5 && hour<12) greeting='Dobro jutro';
  else if(hour>=12 && hour<18) greeting='Dobar dan';
  const greetingEl=document.getElementById('gateGreeting');
  const clockEl=document.getElementById('gateClock');
  const dateEl=document.getElementById('gateDate');
  const userName=(window.masterState&&window.masterState.user&&window.masterState.user.name)||document.getElementById('topUserName')?.textContent||'Stefan';
  if(greetingEl) greetingEl.textContent=`${greeting}, ${userName}!`;
  if(clockEl) clockEl.textContent=now.toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  if(dateEl) dateEl.textContent=now.toLocaleDateString('hr-HR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).toUpperCase();
}
updateTaskerWelcome();
setInterval(updateTaskerWelcome,1000);