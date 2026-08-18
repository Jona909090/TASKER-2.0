function updateTaskerWelcome(){
  const now=new Date();
  const hour=now.getHours();
  let greeting='Dobro veče';
  if(hour>=5 && hour<12) greeting='Dobro jutro';
  else if(hour>=12 && hour<18) greeting='Dobar dan';
  else greeting='Dobro veče';
  const greetingEl=document.getElementById('gateGreeting');
  const clockEl=document.getElementById('gateClock');
  const dateEl=document.getElementById('gateDate');
  if(greetingEl) greetingEl.textContent=`${greeting}, Stefan!`;
  if(clockEl) clockEl.textContent=now.toLocaleTimeString('hr-HR',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
  if(dateEl) dateEl.textContent=now.toLocaleDateString('hr-HR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).toUpperCase();
}
updateTaskerWelcome();
setInterval(updateTaskerWelcome,1000);