var faker = require('faker');

exports.handler = function(event, context){
    var order = {};
  
    order.id = event.orderId;
    order.name = getName();
    order.address = getShippingAddress();
    order.city = getShippingCity();
    order.state = getShippingState();
    order.phone = getPhone();
    order.shipMethod = getShipMethod();
    order.price = getPrice();
   
    context.succeed(order);
}

function getName(){
    return faker.name.findName();
}

function getShippingAddress(){
    return faker.address.streetAddress() + " " +
    faker.address.streetName() + " " +
    faker.address.streetSuffix();
}

function getShippingCity(){
    return faker.address.city();
}

function getShippingState(){
    return faker.address.state();
}

function getPhone(){
    return faker.phone.phoneNumber();
}

function getShipMethod(){
    var shippers = ['FedEx', 'UPS', 'USPS', 'DHL']
    return shippers[Math.floor(Math.random()*4)];
}
function getPrice(){
    return faker.commerce.price();
}


    
