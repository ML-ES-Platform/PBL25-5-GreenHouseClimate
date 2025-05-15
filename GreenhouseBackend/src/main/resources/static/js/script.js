const st = {};

st.flap = document.querySelector('#flap');
st.toggle = document.querySelector('.toggle');

st.musician = document.querySelector('#musician');
st.organizer = document.querySelector('#organizer');
st.selectedAccountType = document.querySelector('#selectedAccountType');
st.submitForm = document.querySelector('#submitForm');

st.flap.addEventListener('transitionend', () => {
    if (st.musician.checked) {
        st.toggle.style.transform = 'rotateY(-15deg)';
        setTimeout(() => st.toggle.style.transform = '', 400);
    } else {
        st.toggle.style.transform = 'rotateY(15deg)';
        setTimeout(() => st.toggle.style.transform = '', 400);
    }
});

st.clickHandler = (e) => {
    if (e.target.tagName === 'LABEL') {
        setTimeout(() => {
            st.flap.children[0].textContent = e.target.textContent;
            st.selectedAccountType.value = e.target.textContent.toLowerCase();
        }, 250);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    st.flap.children[0].textContent = st.organizer.nextElementSibling.textContent;
    st.selectedAccountType.value = st.organizer.nextElementSibling.textContent.toLowerCase();
});

document.addEventListener('click', (e) => st.clickHandler(e));