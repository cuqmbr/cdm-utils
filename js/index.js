const burgerIcon = document.querySelector('#burger');
const navbarMenu = document.querySelector('#nav-links');

burgerIcon.addEventListener('click', () => {
    burgerIcon.classList.toggle('is-active');
    navbarMenu.classList.toggle('is-active');
});

const dropDowns = document.querySelectorAll('#dropdown');

dropDowns.forEach(element => {
    element.addEventListener('click', () => {
        element.classList.toggle('is-active');
    })
});