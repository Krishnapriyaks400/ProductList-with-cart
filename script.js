document.addEventListener("DOMContentLoaded", function () {
  getProducts();
  showCartItems();
});

let productList = [];
let cartProducts = [];
let quantity = "";
let cartTotal = 0;

async function getProducts() {
  const url = "/data.json";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const data = await response.json();
    localStorage.setItem("productList", JSON.stringify(data));
    // console.log("heklosao", productList);
    showProductList();
  } catch (error) {
    console.error(error.message);
  }
}

function showProductList() {
  const listContainer = document.querySelector(".product-list");
  listContainer.innerHTML = "";

  productList = JSON.parse(localStorage.getItem("productList")) || [];

  productList.forEach((item, index) => {
    const listItem = document.createElement("div");
    listItem.className = "listItem";
    listItem.setAttribute("data-item-index", index);
    listItem.innerHTML = `
        <div class="pdt-img-wrapper">
          <img class="item-pdt-img" src="${item.image.desktop}" alt="${item.name}" width="200px">
          <div class="productList-btn">
            <button class="addToCart" data-index="${index}">
              <img src="/assets/images/icon-add-to-cart.svg"> Add to cart
            </button>
            <div class="quantity-container hidden" data-index="${index}">
              <button class="quantity-button decrement">-</button>
              <input type="number" class="quantity-input" value="1" min="0" max="10">
              <button class="quantity-button increment">+</button>
            </div>
          </div>
        </div>
        <div class="pdt-content">
          <p class="pdt-category">${item.category}</p>
          <p class="pdt-name">${item.name}</p>
          <span class="pdt-price">$${item.price}</span>
        </div>
      `;
    listContainer.appendChild(listItem);
  });
}

document.addEventListener("click", function (event) {
  const target = event.target;

  if (target.classList.contains("addToCart")) {
    const index = parseInt(target.dataset.index, 10);
    const selectedProduct = productList[index];

    cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];

    const existingIndex = cartProducts.findIndex(
      (p) => p.name === selectedProduct.name
    );

    if (existingIndex === -1) {
      cartProducts.push({ ...selectedProduct, quantity: 1 });
    } else {
      cartProducts[existingIndex].quantity += 1;
    }

    localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
    showCartItems();

    const listItem = target.closest(".listItem");
    listItem.querySelector(".addToCart").classList.add("hidden");
    listItem.querySelector(".quantity-container").classList.remove("hidden");
    listItem.querySelector(".item-pdt-img").classList.add("red-border");
    const quantityContainer = listItem.querySelector(".quantity-container");
    const quantityInput = listItem.querySelector(".quantity-input");
    quantityContainer.hidden = false;
    quantityContainer.classList.remove("hidden");
    quantityContainer.classList.add("show");

    quantityInput.value = cartProducts.find(
      (p) => p.name === selectedProduct.name
    ).quantity;
  }

  if (target.classList.contains("increment")) {
    const index = parseInt(
      target.closest(".quantity-container").dataset.index,
      10
    );
    const product = cartProducts.find(
      (p) => p.name === productList[index].name
    );
    if (product && product.quantity < 10) {
      product.quantity += 1;
      target
        .closest(".quantity-container")
        .querySelector(".quantity-input").value = product.quantity;
      localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
      showCartItems();
    }
  }

  if (target.classList.contains("decrement")) {
    const index = parseInt(
      target.closest(".quantity-container").dataset.index,
      10
    );
    const product = cartProducts.find(
      (p) => p.name === productList[index].name
    );
    const listItem = target.closest(".listItem");
    if (product) {
      product.quantity -= 1;
      if (product.quantity <= 0) {
        cartProducts = cartProducts.filter(
          (p) => p.name !== productList[index].name
        );
        listItem.querySelector(".addToCart").classList.remove("hidden");
        listItem.querySelector(".quantity-container").classList.add("hidden");
        listItem.querySelector(".item-pdt-img").classList.remove("red-border");
      } else {
        listItem.querySelector(".quantity-input").value = product.quantity;
      }
      localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
      showCartItems();
    }
  }
  if (target.classList.contains("cart-remove")) {
    const removeItemName = target.getAttribute("data-pdt-name");
    console.log("removed", removeItemName);
    cartProducts = cartProducts.filter((item) => item.name !== removeItemName);
    console.log("removedArra", cartProducts);

    localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
    showCartItems();

    const productIndex = productList.findIndex(
      (item) => item.name === removeItemName
    );
    const listItem = document.querySelector(
      `.listItem[data-item-index="${productIndex}"]`
    );
    if (listItem) {
      listItem.querySelector(".addToCart").classList.remove("hidden");
      listItem.querySelector(".quantity-container").classList.add("hidden");
      listItem.querySelector(".item-pdt-img").classList.remove("red-border");
    }
  }
  if (target.classList.contains("confirm-oder")) {
    confirmModal();
  }
  if (event.target.classList.contains("modal-btn-new-order")) {
    const modal = document.querySelector(".modal");
    const modalOverlay = document.getElementById("modal");
    if (modal) {
      modal.classList.add("hidden");
      modalOverlay.style.display = "none";
      window.location.reload();
    }
  }
});

function showCartItems() {
  console.log(cartProducts, "showCartItemsjhhjgfh");

  cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];
  const confirmBtn = document.querySelector(".confirm-oder");
  const cartItemsContainer = document.querySelector(".cart-items-container");
  const cartTitle = document.querySelector(".cart-title");
  const emptyCart = document.querySelector(".empty-cart");
  const cartTotalContainer = document.querySelector(".cart-total");
  const cartTotaldeliverMsg = document.querySelector(".cart-deliverMsg");

  cartItemsContainer.innerHTML = "";
  cartTotalContainer.innerHTML = "";

  cartTotal = 0;

  cartTitle.textContent = `Your Cart(${cartProducts.length})`;

  if (cartProducts.length === 0) {
    emptyCart.style.display = "block";
    cartTotalContainer.style.display = "none";
    cartTotaldeliverMsg.style.display = "none";
    confirmBtn.style.display = "none";
    return;
  } else {
    emptyCart.style.display = "none";
    cartTotalContainer.style.display = "block";
    cartTotaldeliverMsg.style.display = "flex";
    confirmBtn.style.display = "block";
  }

  cartProducts.forEach((item, index) => {
    const itemTotal = total(item.price, item.quantity);
    cartTotal += itemTotal;

    const cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
        <div class="cart-item-content">
          <p>${item.name}</p>
          <div class="quant-wrapper">
            <span class="quantity">${item.quantity}x</span>
            <span>@$${item.price}</span>
            <span class="cart-item-content-total">$${itemTotal.toFixed(
              2
            )}</span>
          </div>
        </div>
        <div class="cart-item-remove">
          <button class="cart-remove" data-pdt-name="${
            item.name
          }" data-index="${index}">Remove</button>
        </div>`;
    cartItemsContainer?.appendChild(cartItem);
  });

  const totalContent = document.createElement("div");
  totalContent.classList.add("cart-itemsTotal");
  totalContent.innerHTML = `
      <p class="cart-items-total-content">Order Total:</p>
      <span class="order-total-price">$${cartTotal.toFixed(2)}</span>`;
  cartTotalContainer?.appendChild(totalContent);

  function total(price, q) {
    return price * q;
  }
}

function confirmModal() {
  //const confirmBtn = document.querySelector(".confirm-oder");
  const modalpdtList = document.querySelector(".modal-pdt-list");
  const modal = document.querySelector(".modal");
  const modalOverlay = document.getElementById("modal");

  //   confirmBtn?.addEventListener("click", () => {
  console.log("open modal");

  modalpdtList.innerHTML = "";
  if (!modal) {
    return;
  }
  // modal.hidden = false;
  modalOverlay.style.display = "flex";
  modal.classList.remove("hidden");

  const modalContainer = document.createElement("div");
  modalContainer.classList.add("modal-container");

  // function total(price, q) {
  //   return price * q;
  // }

  cartProducts.forEach((item) => {
    console.log("new order", cartTotal);

    const modalItem = document.createElement("div");
    modalItem.classList.add("modal-pdt-item");
    modalItem.innerHTML = `
      <div class="image-wrapper">
        <img src="${item.image.thumbnail}" alt="${item.name}" width="50px">
        <div class="pdt-item-info">
          <p>${item.name}</p>
          <div class="price-wrapper">
            <span class="quantity">${item.quantity}x</span>
            <span>$${item.price}</span>
          </div>
        </div>
        </div>
        <span class="pdts-total">$${(item.quantity * item.price).toFixed(
          2
        )}</span>
      `;
    modalContainer.appendChild(modalItem);
  });
  const modalPdtsTotal = document.createElement("div");
  modalPdtsTotal.classList.add("modal-pdt-items-total");
  modalPdtsTotal.innerHTML = `
       <p>Order Total</p>
       <span>$${cartTotal.toFixed(2)}</span>
      `;
  modalContainer.appendChild(modalPdtsTotal);
  modalpdtList.appendChild(modalContainer);
  //   });
}
