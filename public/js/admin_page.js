// detect page from url
const url = new URL(window.location.href);
const page = window.location.href.split('/')[4]

const sideBarButtons = document.querySelectorAll('.side-bar-button');

sideBarButtons.forEach(button => {
    if(button.getAttribute('name') === page) button.classList.add('active');
    button.addEventListener('click', () => {
        sideBarButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        window.location.href = `/admin/${button.getAttribute('name')}`;
    });
});