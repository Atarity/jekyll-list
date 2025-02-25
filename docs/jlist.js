class JList {

    constructor(param) {

        var self = this;

        Object.assign(this, {
            name: "JList",
            faviconText: "",
            el: "#jlist",
            limit: 10,
            db: "db.json",
            fields: [
               {"name": "Category", "field": "tags", "type": "tag"},
               {"name": "Skill levels", "field": "level", "type": "tag"},
               {"name": "Artifacts", "field": "artifacts", "type": "tag"},
               {"name": "Author", "field": "author", "type": "select"},
            ],
            searchFields: ["name", "author", "description", "notes", "tags", "level"]
        }, param);

        this.currentPage = 1;
        this.totalPages = 0;

        this.init();

    }

    init() {

        this.css();

        let wrap = document.querySelector(this.el);
        if (!wrap || !wrap.length) { wrap = document.querySelector("body").firstElementChild; }

        this.wrap = wrap;
        this.wrap.classList.add("jlist-wrap");

        this.buildHeader();
        this.buildMain();
        this.buildItem();

        document.querySelectorAll(".title").forEach((el) => {

            el.textContent = this.name;

        });

        document.addEventListener('db-loaded', () => { this.aside() });

        this.favicon(this.faviconText);
        this.DB_load();

        window.addEventListener('scroll', () => this.handleScroll());

    }

    buildHeader() {

        let header = document.createElement("header");
        header.innerHTML = `<h1><a href="#" class="title"></a></h1>
            <input type="search" placeholder="search..." class="searchbox" /><span class="filter-toggle">filter</span>`;

        this.wrap.appendChild(header);
        this.headerEl = document.querySelector("aside");

        document.querySelector(".filter-toggle").addEventListener("click", (e) => {
            document.body.classList.add("filter");
        });

    }

    buildMain() {

        let div = document.createElement("div");
        div.classList = "main";
        div.innerHTML = `<aside></aside><div class="grid-wrap"><div class="grid"></div></div><div class="item-wrap"><div class="item-inner"></div><span>&times;</span></div>`;

        this.wrap.appendChild(div);
        this.asideEl = document.querySelector("aside");
        this.gridEl  = document.querySelector(".grid");
        this.itemEl  = document.querySelector(".item-wrap");
        this.itemInr = document.querySelector(".item-inner");

        document.querySelector(".grid").addEventListener("click", (e) => {

            e.preventDefault();

            if (e.target.classList.contains("grid-item")) {

                let ID = e.target.getAttribute("data-id");
                this.single(ID);

            }

        });

    }

    buildItem(item = false) {

        if (!this.itemReady) {

            let div = document.createElement("div");
            div.classList = "item-name";
            this.itemInr.appendChild(div);

        }

        document.querySelector(".item-wrap span").addEventListener("click", function() {

            document.body.classList.remove("single");
            location.hash = "home";

            return false;

        });

    }

    buildEl(data) {

        let html = `<h3>${data.name}</h3>`,
        type = data.type;

        if (data.hasOwnProperty("__isGridItem")) {
            type = "item";
        }


        switch(type) {

            case "category":

                html+= `<div class="filter tag-list category-list category--${data.field}" data-field="${data.field}">`;

                for(let nn in this.fieldValues[data.field]) {

                    let text = this.fieldValues[data.field][nn];
                    html+=`<div class="tag--item category--item">${text}</div>`

                }

                html+= `</div>`

                break;

            case "tag":

                html+= `<div class="filter tag-list tag--${data.field}" data-field="${data.field}">`;

                for(let nn in this.fieldValues[data.field]) {

                    let text = this.fieldValues[data.field][nn];
                    html+=`<div class="tag--item">${text}</div>`

                }

                html+= `</div>`

                break;

            case "select":

                html+= `<div class="filter select-list select--${data.field}"><select class="filter-item" data-field="${data.field}" name="${data.field}"><option value="">All</option>`;

                    for(let nn in this.fieldValues[data.field]) {

                        let text = this.fieldValues[data.field][nn],
                        val = text.replace(/"/g, '\\"');

                        html+=`<option value="${val}">${text}</option>`

                    }

                html+= `</select></div>`
                break;

            case "item":

                let img = this.getImage(data);

                html = `<a href="#">
                            <div><img src="`+img+`"/></div>
                            <div><h4>${data.author}</h4></div>
                            <div><h2>${data.name}</h2></div>
                            <div class="descr">${data.description}</div>
                        </a>`;

                break;


        }

        return html;

    }

    favicon(textIn = '', background = '#ffffff', color = '#333333') {

        if (!textIn) { textIn = this.name.substring(0,1); }

        const text    = String(textIn).substring(0, 3).toUpperCase();
        const canvas  = document.createElement('canvas');
        const size    = 64;
        canvas.width  = size;
        canvas.height = size;

        const ctx = canvas.getContext('2d');

        ctx.fillStyle = background;
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle    = color;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';


        const fontSize = text.length === 1 ? 48 : 36;
        ctx.font = `bold ${fontSize}px Arial`;


        ctx.fillText(text, size/2, size/2);

        const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
        link.type  = 'image/png';
        link.rel   = 'shortcut icon';
        link.href  = canvas.toDataURL('image/png');

        document.head.appendChild(link);

    }

    async DB_load(url = '') {

        if (!url) { url = this.db; }

        try {

            const response = await fetch(url, {
                mode: 'cors',
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this._db = await response.json();

            for(let nn in this._db){

                this._db[nn].ID = Number(nn);

            }

            this.values();

            console.log('Database loaded successfully');
            setTimeout(() => document.dispatchEvent(new Event('db-loaded')), 500);

            this.totalPages = Math.ceil(this._db.length / this.limit);

            return true;

        } catch (error) {

            console.error('Database load failed:', error);
            this._db = null;

            throw error;

        }

    }

    lazyLoad() {

        const lazyImages = document.querySelectorAll('img[data-src], img[data-srcset]');
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const loadImage = (image) => {

            const src = image.getAttribute('data-src');
            const srcset = image.getAttribute('data-srcset');

            if (src) {
                image.src = src;
            }

            if (srcset) {
                image.srcset = srcset;
            }

            image.onload = () => {

                image.removeAttribute('data-src');
                image.removeAttribute('data-srcset');
                image.classList.add("loaded");

            };

        };

        const imageObserver = new IntersectionObserver((entries, observer) => {

            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadImage(entry.target);
                    observer.unobserve(entry.target);
                }
            });

        }, options);

        lazyImages.forEach(image => {
            imageObserver.observe(image);
        });

    }

    values() {

        this.fieldValues = {};
        for(let field in this.fields) {

            let f = this.fields[field];

            if(f.type == "category" || f.type == "tag" || f.type == "select") {

                this.fieldValues[f.field] = [];

                for(let nn in this._db) {

                    let val = this._db[nn][f.field];

                    if (typeof val == "object") {

                        //console.log(val);

                        for(let n in val) {

                            let vval = val[n];

                            if (typeof vval == "object") {

                                vval = Object.keys(vval)[0];

                            }

                            if (!this.fieldValues[f.field].includes(vval)) {
                                this.fieldValues[f.field].push(vval);
                            }

                        }

                    } else {

                        if (!this.fieldValues[f.field].includes(val)) {
                            this.fieldValues[f.field].push(val);
                        }

                    }

                }

                this.fieldValues[f.field].sort();

            }

        }

    }

    aside() {

        let item = this._db[0],
        fieldsQty = 0, field, f, div;

        this.asideEl.innerHTML = '';

        const fragment = new DocumentFragment();

        for(field in this.fields) {

            f = this.fields[field];

            if (item.hasOwnProperty(f.field)) {

                div = document.createElement("div");
                div.classList = "aside-item";
                div.innerHTML = this.buildEl(f);
                fragment.appendChild(div);

            }

            this.asideEl.appendChild(fragment);

        };


        div = document.createElement("div");
        div.classList = "aside-filter";
        div.innerHTML = '<button class="filter-ok">OK</button><button class="filter-clear">Clear</button>';
        this.asideEl.appendChild(div);

        document.querySelectorAll(".tag--item").forEach((element) => {

            element.addEventListener("click", (e) => {

                let el = e.target;

                if (el.classList.contains("active")) {
                    el.classList.remove("active");
                } else {
                    el.classList.add("active");
                }

                this.search();

            });

        });

        document.querySelectorAll("select.filter-item").forEach((element) => {

            element.addEventListener("change", (e) => {

                this.search();

            });


        });

        document.querySelector(".searchbox").addEventListener("keyup", (e) => {
            this.search();
        });

        document.querySelector(".searchbox").addEventListener("change", (e) => {
            this.search();
        });

        document.querySelector(".searchbox").addEventListener("input", (e) => {
            if (e.target.value === '') {
                this.search();
            }
        });

        document.querySelector(".filter-ok").addEventListener("click", (e) => {

            document.body.classList.remove("filter");

        });

        document.querySelector(".filter-clear").addEventListener("click", (e) => {

            document.querySelectorAll(".tag--item.active").forEach((e) => {
                e.classList.remove("active");
            });

            document.querySelectorAll("select").forEach((e) => {
                e.value = "";
            });

            document.body.classList.remove("filtered");
            this.search();

        });

        this.search();

        if (location.hash) {

            let ID = location.hash.split(":");
            ID = Number(ID[ID.length - 1]);

            if (ID) { this.single(ID); }

        }

    }

    search() {

        let filter = {}, filtered = false;
        document.querySelectorAll(".filter").forEach((element) => {

            let fName = element.getAttribute("data-field");

            if (fName) {

                filter[fName] = [];

                element.querySelectorAll(".tag--item.active").forEach((t) => {

                    filtered = true;
                    filter[fName].push(t.textContent);

                });

            }

        });

        document.querySelectorAll(".filter-item").forEach((element) => {

            let fName = element.getAttribute("data-field");
            filter[fName] = [];

            let val = element.value;
            let selectedText = element.options[element.selectedIndex].text;

            if (val) {

                filtered = true;
                filter[fName].push(selectedText);

            }

        });

        if (filtered) {

            document.body.classList.add("filtered");

        } else {

            document.body.classList.remove("filtered");

        }

        let searchQuery = document.querySelector(".searchbox").value;
        if (searchQuery) { filter.search = searchQuery; }

        this.currentPage = 1;

        console.log(filter);



        this.results(filter);

    }

    handleScroll() {

        if (document.body.classList.contains("single")) { return false; }

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
            if (this.currentPage < this.totalPages) {
                this.loadNextPage();
            }
        }

    }

    loadNextPage() {

        this.currentPage++;

        console.log("page: " + this.currentPage);
        this.results(this.currentFilter, this.currentPage);

    }

    filter(filter = "", page = 1) {

        const filteredData = this._db.filter(item => {

            const filterEntries = Object.entries(filter);

            return filterEntries.every(([field, filterValues]) => {

                if (!Array.isArray(filterValues) || filterValues.length === 0) return true;

                const itemValue = item[field];

                const isArrayFilter = Array.isArray(itemValue);
                const isObjectArrayFilter = isArrayFilter && itemValue.every(v => typeof v === 'object');

                if (isObjectArrayFilter) {
                    return filterValues.every(filterField =>
                        itemValue.some(obj => obj[filterField] && obj[filterField] !== "")
                    );
                }

                if (isArrayFilter) {
                    return itemValue.some(v => v && v !== "" && filterValues.includes(v));
                }

                return filterValues.includes(itemValue) && itemValue && itemValue !== "";

            }) && (!filter.search || (filter.hasOwnProperty("search") && Object.values(item).some(value =>
                String(value).toLowerCase().includes(filter.search.toLowerCase())
            )));

        });


        const totalItems   = filteredData.length;
        const itemsPerPage = this.limit;
        const totalPages   = Math.ceil(totalItems / itemsPerPage);

        page = Math.max(1, Math.min(page, totalPages));

        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;

        this.currentFilter = filter;

        return {
            items: filteredData.slice(startIndex, endIndex),
            pagination: {
                currentPage: page,
                totalPages,
                totalItems,
                itemsPerPage
            }
        };

    }

    results(filter = "", page = 1) {

        let query = this.filter(filter, page);
        if (page == 1) { this.gridEl.innerHTML = ''; }

        this.totalPages = query.pagination.totalPages;

        if (query.pagination.totalItems) {

            const fragment = new DocumentFragment();

            for(let nn in query.items) {

                let item = query.items[nn];
                item.__isGridItem = true;

                const div = document.createElement("div");
                div.classList  = "grid-item";
                div.innerHTML  = this.buildEl(item);
                div.setAttribute("data-id", item.ID);

                fragment.appendChild(div);

            }

            this.gridEl.appendChild(fragment);

        } else {

            this.gridEl.innerHTML = '<p>nothing found</p>';

        }

        this.lazyLoad();
        console.log(query);

    }

    getImage(data) {

        let img = "";
        if (!img && data.hasOwnProperty("image")) { img = data.image; }
        if (!img && data.hasOwnProperty("picture")) { img = data.picture; }

        if (this.hasOwnProperty("imgPath")) {
            img = this.imgPath + img;
        }

        return img;

    }

    single(ID) {

        document.body.classList.add("single");
        let item = this._db[ID],
        img = this.getImage(item), div, nn, fieldData;

        this.singleURL(item);
        this.itemInr.style.backgroundImage = `url(${img})`;

        for(nn in this.cardFields) {

            fieldData = this.cardFields[nn];

            if (item.hasOwnProperty(fieldData.field)) {

                let dataWrap = this.itemInr.querySelector(".item-" + fieldData.field);

                if (!dataWrap) {

                    div = document.createElement("div");
                    div.classList = "item-field item-" + fieldData.field;
                    div.innerHTML = this.singleValue(item, fieldData);
                    this.itemInr.appendChild(div);

                } else {

                    dataWrap.innerHTML = this.singleValue(item, fieldData);

                }

            }

        }

    }

    singleURL(item) {

        let url = item.name;
        url = url.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();

        url+= ":" + item.ID;

        location.hash = url;

    }

    singleValue(item, f) {

        let val = item[f.field];



        if (typeof val == "object") {

            if (typeof val[0] == "object") {

                let valStr = "<ul class=\"artifacts-list\">";
                for(let nn in val) {

                    for(let n in val[nn]) {

                        valStr+="<li>" + ((val[nn][n] === true || typeof val[nn][n] == "string") ? "<span class=\"plus\">+</span>" : "<span class=\"minus\">-</span>") + n + "</li>";

                    }

                }

                valStr+="</ul>";

                val = valStr;

            } else {

                let valStr = "<ul class=\"values-list\">";
                for(let nn in val) {
                    valStr+="<li>" + val[nn] + "</li>";
                }

                valStr+="</ul>";

                val = valStr;

            }

        }

        if (f.hasOwnProperty("link")) {

            val = '<a href="'+val+'" target="_blank">' + (f.link ? f.link : val) + '</a>';

        } else {

            if (typeof val === "string") {
                val = val.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
            }

        }

        if (f.hasOwnProperty("label")) {

            val = "<label>" + f.label + "</label>" + val;

        }

        return val;

    }

    css() {

        const styles = `
            html, body {
                padding: 0;
                margin: 0;
                color: #333;
                font-family: sans-serif;
            }

            body.filter {
                overflow: hidden;
            }

            .jlist-wrap {
                display: flex;
                flex-direction: column;
                max-width: 80rem;
                margin: 0 auto;
            }

            .jlist-wrap header {
                display: flex;
                flex-direction: row;
                padding: .5rem;
                gap: 30px;
                align-items: center;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / .05);
                top: 0;
                position: sticky;
                background: #FFF;
                z-index: 2;
            }

            .jlist-wrap h1 {
                padding: 0;
                margin: 0;
                font-size: large;
            }

            .jlist-wrap h1 a {
                text-decoration: none;
                color: #333;
                font-size: 1.5rem;
            }

            .jlist-wrap input.searchbox {
                background-color: rgb(244,244,245);
                border: 1px solid;
                border-radius: .25rem;
                padding: 0 5px;
                margin: 0;
                border-color: #6b7280;
                appearance: none;
                height: 30px;
            }

            .jlist-wrap aside {
                max-width: 15rem;
                height: calc(100vh - 30px);
                padding: .5rem;
                position: sticky;
                scrollbar-width: none;
                overflow-y: auto;
                box-sizing: border-box;
                user-select: none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                top: 3rem;
                background: #FFF;
                z-index: 1;
                border-right: .5px solid rgba(0,0,0,0.05);
            }

            .jlist-wrap .grid {
                grid-template-columns: repeat(3, minmax(0, 1fr));
                grid-template-rows: auto 1fr;
                display: grid;
                box-sizing: border-box;
                width: 100%;
            }

            .jlist-wrap .aside-item {
                margin: .5rem 0 .5rem 0;
            }

            .jlist-wrap aside input,
            .jlist-wrap aside select {
                padding: .25rem;
                font-size: .75rem;
                line-height: 1rem;
                border-radius: .125rem;
                width: 100%;
                appearance: none;
                background-color: #fff;
                border-color: #6b7280;
                border-width: 1px;
            }

            .jlist-wrap input[type="checkbox"] {
                position: relative;
                cursor: pointer;
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                border: none;
                padding: 0;
                margin: 0;
                outline: none;
                width: 16px;
                flex: 0 0 16px;
                height: 16px;
                background-color: #CCC;
                border-radius: 5px;
            }

            .jlist-wrap input[type="checkbox"]:checked::after {
                content: "";
                position: absolute;
                left: 2px;
                top: 2px;
                right: 2px;
                bottom: 2px;
                background-color: #333;
                border: none;
                border-radius: 4px;
            }

            .jlist-wrap label {
                margin-bottom: 5px;
                display: inline-block;
                margin-right: 10px;
            }

            .jlist-wrap label > h3 {
                margin: 0;
                line-height: normal;
                font-size: medium;
                margin-top: -3px;
            }

            .jlist-wrap .tag--item {
                display: inline-block;
                margin-bottom: .5rem;
                margin-right: .5rem;
                border: 1px solid #333;
                padding: 5px;
                box-sizing: border-box;
                border-radius: .125rem;
                cursor: pointer;
                font-size: 14px;
                font-weight: 100;
            }

            .jlist-wrap .tag--item:hover {
                background-color: rgb(228,228,231);
            }

            .jlist-wrap .tag--item.active {
                background-color: rgb(82,82,91);
                border-color: rgb(82,82,91);
                color: #FFF;
            }

            .jlist-wrap .category--item {
                width: 100%;
            }

            .jlist-wrap .main {
                display: flex;
                flex-direction: row;
            }

            .jlist-wrap .grid-item {
                padding: .5rem;
                box-sizing: border-box;
                width: 100%;
                border: .5px solid rgba(0,0,0,0.05);
            }

            .jlist-wrap .grid-item img {
                width: 100%;
                height: 250px;
                min-height: 250px;
                background: rgba(0,0,0,0.1);
                text-indent: 1000px;
                display: block;
                object-fit: cover;
            }

            .jlist-wrap .grid-item a {
                color: #333;
                text-decoration: none;
                display: flex;
                flex-direction: column;
                gap: .5rem;
            }

            .jlist-wrap .grid-item h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 100;
                padding: 3px;
                border-left: 1px solid;
                border-bottom: 1px solid;
                display: inline-block;
            }

            .jlist-wrap .grid-item h2 {
                margin: 10px 0 0 0;
                font-size: 15px;
                text-transform: uppercase;
                font-weight: bolder;
            }

            .jlist-wrap .grid-item:hover {
                background-color: rgb(228,228,231);
            }

            .jlist-wrap .descr {
                font-weight: 100;
                font-size: 14px;
            }

            .jlist-wrap .grid-wrap {
                flex: 1;
                position: relative;
            }

            .jlist-wrap .item-wrap {
                position: fixed;
                width: calc(100% - 15px);
                height: calc(100dvh - 60px);
                background: #FFF;
                z-index: 2;
                display: none;
                box-sizing: border-box;
                flex-direction: column;
                border: .5px solid rgba(0, 0, 0, 0.05);
                max-width: 80rem;
            }

            .single .jlist-wrap .item-wrap {
                display: flex;
            }

            .single .jlist-wrap .grid-wrap:before {
                content: '';
                width: 100%;
                height: 100%;
                background: #FFF;
                display: block;
                position: absolute;
                left: 0;
                top: 0;
            }

            .jlist-wrap .item-wrap > span {
                font-size: 1em;
                position: absolute;
                right: 15px;
                cursor: pointer;
                z-index: 2;
                background: #FFF;
                top: 15px;
                color: #333;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 32px;
            }

            .jlist-wrap .grid-item > a {
                pointer-events: none;
            }

            .jlist-wrap .item-inner {
                height: auto;
                background-size: cover;
                background-position: center center;
                background-repeat: no-repeat;
                position: relative;
                padding: 15px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                gap: 20px;
                min-height: calc(100dvh - 60px);
            }

            .jlist-wrap .item-inner > div {
                position: relative;
                z-index: 2;
                color: #FFF;
                max-width: 80%;
            }

            .jlist-wrap .item-description {
                font-size: 2em;
                font-weight: 100;
            }

            .jlist-wrap .item-notes {
                font-weight: 100;
            }

            .jlist-wrap .item-inner:before {
                content: '';
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                backdrop-filter: blur(5px);
                z-index: 1;
            }

            .jlist-wrap .item-name {
                font-size: 3rem;
                color: #FFF;
            }

            .jlist-wrap ul.values-list {
                padding: 0;
                margin: 0;
                display: flex;
                flex-direction: row;
                gap: 10px;
            }

            .jlist-wrap ul.values-list li {
                list-style: none;
                border: 1px solid;
                padding: 0 5px;
            }

            .jlist-wrap label {
                margin-bottom: 5px;
                display: inline-block;
                color: #FFF;
                padding: 0;
                width: 100%;
                border-bottom: .5px solid #FFF;
                font-weight: 600;
            }

            .jlist-wrap .item-wrap a {
                color: #FFF;
                text-decoration: blink;
                margin-top: 0;
                display: inline-block;
                text-decoration: underline;
            }

            .jlist-wrap .item-wrap .item-link a {
                color: #FFF;
                text-decoration: blink;
                border: 1px solid;
                padding: 15px;
                margin-top: 15px;
                display: inline-block;
                width: 100px;
                text-align: center;
                background: #FFF;
                color: #333;
            }

            .jlist-wrap .item-field.item-link {
                position: absolute !important;
                bottom: 30px;
                left: 50%;
                margin-left: -50px;
            }

            .jlist-wrap ul.artifacts-list {
                padding: 0px;
                margin: 5px 0 0 0;
            }

            .jlist-wrap ul.artifacts-list li {
                list-style: none;
                margin-bottom: 5px;
            }

            .jlist-wrap span.plus,
            .jlist-wrap span.minus {
                width: 16px;
                height: 16px;
                background: #FFF;
                color: #333;
                display: flex;
                align-items: center;
                justify-content: center;
                float: left;
                margin: 2px 9px 0 0;
                line-height: 16px;
            }

            .jlist-wrap span.minus {
                background: transparent;
                color: #FFF;
                border: 1px solid;
                box-sizing: border-box;
            }

            .jlist-wrap .aside-filter {
                padding: 5px 0;
            }

            .filtered .jlist-wrap .filter-clear {
                display: inherit;
                background: transparent;
                color: #333;
                border: 1px solid;
                margin-top: 5px;
            }

            .jlist-wrap button {
                background: #333;
                color: #FFF;
                border: none;
                padding: 10px 5px;
                width: auto;
                display: inline-block;
                width: 100%;
            }

            .jlist-wrap .filter-clear {
                display: none;
            }

            .jlist-wrap .filter-ok {
                display: none;
            }

            .jlist-wrap span.filter-toggle {
                cursor: pointer;
                text-decoration: underline;
                position: absolute;
                right: 15px;
                display: none;
            }

            @media (max-width: 767px) {

                .jlist-wrap .main {
                    flex-direction: column;
                }

                .jlist-wrap aside {
                    max-width: none;
                    width: 100%;
                    position: fixed;
                    height: 100vh;
                    top: 0;
                    z-index: 1;
                    background: #FAFAFA;
                    display: none;
                }

                .filter .jlist-wrap aside {
                    display: block;
                    margin-top: 20px;
                }

                .jlist-wrap .grid {
                    grid-template-columns: repeat(1, minmax(0, 1fr));
                }

                .jlist-wrap .grid-item {
                    padding: 1rem;
                }

                .jlist-wrap .aside-item {
                    margin: .5rem 0 .5rem 0;
                    padding: .5rem;
                    background: #FFF;
                    border-radius: .125rem;
                }

                .jlist-wrap .item-wrap {
                    position: fixed;
                    width: 100%;
                    min-height: 100dvh;
                    top: 0;
                    overflow: auto;
                    padding-bottom: 50px;
                }

                .jlist-wrap .item-inner > div {
                    max-width: 100%;
                }

                .jlist-wrap .item-field.item-link {
                    position: fixed !important;
                    bottom: 0;
                    left: 0;
                    margin-left: 0;
                    width: 100%;
                    z-index: 3;
                }

                .jlist-wrap .item-wrap .item-link a {
                    width: 100%;
                    margin: 0;
                    box-sizing: border-box;
                }

                .jlist-wrap .item-name {
                    font-size: 2rem;
                }

                .jlist-wrap .item-description {
                    font-size: 1em;
                }

                .jlist-wrap .filter-ok {
                    display: inline-block;
                }

                .jlist-wrap .item-wrap > span {
                    right: 0;
                    top: 0;
                    position: fixed;
                }

                .jlist-wrap span.filter-toggle {
                    display: inline-block;
                }

                .jlist-wrap .item-inner {
                    min-height: 100dvh;
                }

            }
        `;

        const styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);

    }

}