class MainScreen extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        shadow.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100vw;
                    height: 100vh;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
            </style>
            <span>TBD</span>
        `;
    }
}

customElements.define('main-screen', MainScreen);
