import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, onSnapshot, doc, updateDoc, deleteDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

 
const firebaseConfig = {
  apiKey: "AIzaSyBV2EnvHVHMhH09Tl_pdoLL9rsyr78FWoc",
  authDomain: "nightbite-e11ae.firebaseapp.com",
  databaseURL: "https://nightbite-e11ae-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "nightbite-e11ae",
  storageBucket: "nightbite-e11ae.firebasestorage.app",
  messagingSenderId: "76062594463",
  appId: "1:76062594463:web:927e606ca31809abd959aa",
  measurementId: "G-BCPFL8L53M"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

 
let cart = [];
let parcelCharge = 0;
let currentUser = null;


onSnapshot(doc(db, "settings", "global"), (snap) => {
    if(snap.exists()) {
        parcelCharge = snap.data().parcelPerItem || 0;
        document.getElementById('parcelChargeDisplay').innerText = `₹${parcelCharge}`;
        calculateBill();
    }
});
 
onSnapshot(collection(db, "menu"), (snapshot) => {
    const menuGrid = document.getElementById('menuGrid');
    menuGrid.innerHTML = '';
    snapshot.forEach((doc) => {
        const item = doc.data();
        menuGrid.innerHTML += `
            <div class="bg-white p-4 rounded-2xl shadow-md hover:shadow-xl transition">
                <img src="${item.image}" class="w-full h-40 object-cover rounded-xl mb-4">
                <h3 class="font-bold text-lg">${item.name}</h3>
                <p class="text-orange-600 font-bold text-xl">₹${item.price}</p>
                <button onclick="addToCart('${doc.id}', '${item.name}', ${item.price})" 
                    class="w-full mt-3 bg-gray-900 text-white py-2 rounded-lg hover:bg-orange-500 transition">
                    Add to Cart
                </button>
            </div>`;
    });
});
 
onSnapshot(collection(db, "orders"), (snapshot) => {
    const container = document.getElementById('orderNotifications');
    container.innerHTML = '';
    snapshot.forEach((d) => {
        const order = d.data();
        if(order.status === "pending") {
            container.innerHTML += `
                <div class="bg-white p-4 border-l-4 border-orange-500 shadow-sm rounded">
                    <p><strong>User:</strong> ${order.userName} (${order.userPhone})</p>
                    <p><strong>Items:</strong> ${order.items.join(", ")}</p>
                    <p class="text-lg font-bold">Total: ₹${order.total}</p>
                    <button onclick="acceptOrder('${d.id}', '${order.userPhone}', ${order.total})" 
                        class="bg-green-600 text-white px-4 py-1 rounded mt-2">Accept Order</button>
                </div>`;
        }
    });
});

 

window.addToCart = (id, name, price) => {
    cart.push({ id, name, price });
    updateCartUI();
};

function updateCartUI() {
    const list = document.getElementById('cartItems');
    list.innerHTML = cart.map((item, index) => `
        <div class="flex justify-between items-center bg-gray-50 p-2 rounded">
            <span>${item.name}</span>
            <div class="flex items-center gap-3">
                <span class="font-bold">₹${item.price}</span>
                <button onclick="removeFromCart(${index})" class="text-red-500">&times;</button>
            </div>
        </div>
    `).join('');
    calculateBill();
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    updateCartUI();
};

function calculateBill() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const totalParcel = cart.length * parcelCharge;  
    const total = subtotal + totalParcel;
    
    document.getElementById('totalBill').innerText = `₹${total}`;
    document.getElementById('cartCount').innerText = cart.length;
    return total;
}
 
window.handleUserSignIn = async () => {
    const name = document.getElementById('uName').value;
    const phone = document.getElementById('uPhone').value;
    const pass = document.getElementById('uPass').value;

    if(!name || !phone) return alert("Fill details");

    await addDoc(collection(db, "users"), { name, phone, pass });
    currentUser = { name, phone };
    document.getElementById('userBtn').innerText = `Hi, ${name}`;
    window.toggleModal('close');
};
 
window.placeOrder = async () => {
    if(!currentUser) return window.toggleModal('userLogin');
    if(cart.length === 0) return alert("Cart is empty!");

    const total = calculateBill();
    await addDoc(collection(db, "orders"), {
        userName: currentUser.name,
        userPhone: currentUser.phone,
        items: cart.map(i => i.name),
        total: total,
        status: "pending",
        timestamp: new Date()
    });
    
    alert("Order Sent to Admin!");
    cart = [];
    updateCartUI();
    window.toggleCart();
};
 

window.addItem = async () => {
    const name = document.getElementById('itemName').value;
    const price = parseInt(document.getElementById('itemPrice').value);
    const image = document.getElementById('itemImg').value;

    await addDoc(collection(db, "menu"), { name, price, image });
    alert("Item Added!");
};

window.setParcelCharge = async () => {
    const val = parseInt(document.getElementById('parcelInput').value);
    await setDoc(doc(db, "settings", "global"), { parcelPerItem: val });
    alert("Parcel Charges Updated!");
};

window.acceptOrder = async (orderId, phone, total) => {
    await updateDoc(doc(db, "orders", orderId), { status: "Accepted" });
    alert(`Order Accepted! Notification sent to ${phone}. Total Bill: ₹${total}`);
};