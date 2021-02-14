import * as params from '@params';
import FlexSearch from "flexsearch";

async function init() {
    const data = fetch(params.index_url);

    const search_btn = document.getElementById("search_btn");
    const search_menu_wrapper = document.getElementById("search_menu_wrapper");
    const search_menu_close_btn = document.getElementById("search_menu_close_btn");
    const search_menu_input = document.getElementById("search_menu_input");
    const search_menu_results = document.getElementById("search_menu_results");

    search_btn.addEventListener("click", function () {
        search_menu_wrapper.classList.remove("hidden");
        search_menu_wrapper.classList.add("flex");
        search_menu_input.focus();
    });

    search_menu_close_btn.addEventListener("click", function () {
        search_menu_wrapper.classList.add("hidden");
        search_menu_wrapper.classList.remove("flex");
    });

    const index_json = await (await data).json();

    // create index
    let id = 0;
    const docs = {
        id: "id",
        field: [
            "title",
            "content"
        ]
    }
    const ascii_index = new FlexSearch({
        doc: docs,
        profile: "score",
        cache: true,
    });
    const nonascii_index = new FlexSearch({
        doc: docs,
        encode: false,
        tokenize: function(str){
            return str.replace(/[\x00-\x7F]/g, "").split("");
        },
        cache: true,
    });
    index_json.forEach(post => {
        post.id = id++;
        ascii_index.add(post);
        nonascii_index.add(post);
    });

    const createItem = (title, permalink, content) => {
        const item = document.createElement("div");
        item.className = "search-menu-result-item";

        const item_link = document.createElement("a");
        item_link.href = permalink;

        const item_title = document.createElement("div");
        item_title.className = "search-menu-result-item-title";
        item_title.innerHTML = title;

        const item_content = document.createElement("div");
        item_content.className = "search-menu-result-item-content";
        item_content.innerHTML = content;

        item_link.appendChild(item_title);
        item_link.appendChild(item_content);
        item.appendChild(item_link);

        return item;
    };

    const clearAllItems = () => {
        while (search_menu_results.firstChild) {
            search_menu_results.removeChild(search_menu_results.lastChild);
        }
    };

    const buildAllItems = () => {
        clearAllItems();
        index_json.forEach(index_item => {
            const item = createItem(index_item.title, index_item.permalink, index_item.content);
            search_menu_results.appendChild(item);
        })
    };

    const search = (value) => {
        clearAllItems();
        let res = ascii_index.search(value);
        if (res.length == 0) {
            res = nonascii_index.search(value);
        }
        res.forEach(post => {
            const item = createItem(post.title, post.permalink, post.content);
            search_menu_results.appendChild(item);
        });
    };

    search_menu_input.addEventListener("input", function () {
        if (this.value === '') {
            buildAllItems();
        } else {
            search(this.value);
        }
    });

    buildAllItems();
}

window.addEventListener("DOMContentLoaded", init);
