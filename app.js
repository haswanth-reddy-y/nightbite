 
async function notifyUser(phone, name, items) {
    const message = `Vanakkam ${name}! 🌿 Your THE NIGHT BITES order (${items}) has been confirmed. It will be ready shortly. Enjoy your meal!`;
    
    
    const formattedPhone = phone.startsWith('91') ? phone : '91' + phone;
    
    const choice = confirm(`Confirm order for ${name}?\n\nOK: Send via WhatsApp\nCancel: Send via SMS`);

    if (choice) {
   
        window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      
        window.location.href = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;
    }
}

 
function confirmOrder(orderId, userPhone, userName, itemsList) {
    db.collection("orders").doc(orderId).update({
        status: "Confirmed"
    }).then(() => {
     
        notifyUser(userPhone, userName, itemsList);
    }).catch((error) => {
        console.error("Error updating order: ", error);
    });
}

 
db.collection("orders").onSnapshot((snapshot) => {
    let orderList = document.getElementById("order-list");
    orderList.innerHTML = "";
    snapshot.forEach((doc) => {
        let order = doc.data();
       
        if(order.status !== "Confirmed") {
            orderList.innerHTML += `
                <div class="order-row">
                    <div>
                        <strong>${order.userName}</strong> (${order.phone})<br>
                        <small>${order.itemsList}</small>
                    </div>
                    <button onclick="confirmOrder('${doc.id}', '${order.phone}', '${order.userName}', '${order.itemsList}')" 
                            style="width: auto; padding: 5px 15px; background: var(--accent); color: #1a202c; font-weight: bold;">
                        Confirm Order
                    </button>
                </div>
            `;
        }
    });
});

function searchFood() {
    let input = document.getElementById('search').value.toLowerCase();
    let cards = document.querySelectorAll('.food-card');
    cards.forEach(card => {
        let title = card.querySelector('h3').innerText.toLowerCase();
        card.style.display = title.includes(input) ? "block" : "none";
    });
}