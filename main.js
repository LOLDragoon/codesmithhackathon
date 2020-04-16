function getGifs(query, callback) {
    let result = [];
    fetch(`https://api.giphy.com/v1/gifs/search?api_key=DdRuswZjmTuAvIoSbv6w1N4BP5w97ITQ&q=${query}&limit=25&offset=0&rating=G&lang=en`)
        .then((response) => response.json())
        .then((json) => {
            for (let entry of json.data) {
                result.push(entry.images.original.url);
            }
            callback(result);
        });
}

function domNode(html, style = {}) {
    let wrapper = document.createElement("div");
    wrapper.innerHTML = html;
    let el = wrapper.firstElementChild;
    for (let prop in style) {
        el.style[prop] = style[prop];
    }
    return el;
}

let popup = null;
let active = null;

document.addEventListener('mouseup', function(e){
    let selection = window.getSelection().toString();

    if (selection.length && selection !== active) {
        active = selection;
        
        getGifs(selection,function(urls){
            let currentUrl = 0;

            popup = domNode(`
                <div class="popup">
                    <img src="${urls[currentUrl] || chrome.runtime.getURL("error.gif")}">
                    <div class="features">
                        <button class="next">next gif</button>
                        <button class="copy">copy to clipboard</button>
                    </div>
                </div>
            `, {
                top: e.pageY + "px",
                left: e.pageX + "px"
            });

            popup.onmousedown = function(e){
                e.stopPropagation();
                return false;
            };
            popup.querySelector(".next").onclick = function(){
                if (urls.length){
                    popup.querySelector("img").src = urls[++currentUrl % urls.length];
                }
            };
            popup.querySelector(".copy").onclick = function(){
                navigator.clipboard.writeText(urls.length ? urls[currentUrl] : "Sorry, but that gif is our error message.");
            };
            
            document.body.appendChild(popup);
        })
    }
});

function closePopup() {
    if (popup) {
        document.body.removeChild(popup);
        popup = null;
        active = null;
    }
}

window.addEventListener('mousedown', function(e){
    closePopup();
});
window.addEventListener('resize', function(e){
    closePopup();
});