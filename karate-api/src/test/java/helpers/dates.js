function fn() {
  var checkin = new Date();
  checkin.setDate(checkin.getDate() + 30);
  
  var checkout = new Date();
  checkout.setDate(checkout.getDate() + 35);
  
  return {
    checkin: checkin.toISOString().split('T')[0],
    checkout: checkout.toISOString().split('T')[0]
  };
}