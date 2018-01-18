'use strict';
(function () {
    const lib = {
        newline: /^\n+/,
        heading: /^(#{1,6})\s*([^\n]+)/, //
        blockquote: /^>([^\n]+)/,
        ulist: /^([*+-])\s*([^\n]+)(?:\n|$)/,
        link: /^\[([^\n]+)\]\(([^\n]+)\)/,
        img: /^!\[([^\n]+)\]\(([^\n]+)\)/,
        bold: /^[*_]{2}([^\n]+)[*_]{2}/,
        italic: /^[*_]([^\n]+)[*_]/,
        hr: /^(-{2,})(?:\n+)/,
        code: /^`([^\n]+)`/,
        codeblock: /^```\s*(\w*)\n((.|[\r\n])+)\n```/,
        text: /([^\n]+)/
    }

    function tokenize(md) {
        let tokens = [],
            token;

        while (md) {
            // Grab newlines
            if (token = lib.newline.exec(md)) {
                tokens.push({
                    rule: 'newline',
                });
                md = md.substring(token[0].length);

                continue;
            }
            // Grab headings (#...######)
            if (token = lib.heading.exec(md)) {
                tokens.push({
                    rule: 'heading',
                    rank: token[1].length,
                    text: token[2]
                });
                md = md.substring(token[0].length);
                continue;
            }
            // Grab blockquotes
            if (token = lib.blockquote.exec(md)) {
                tokens.push({
                    rule: 'blockquote',
                    text: token[1]
                });
                md = md.substring(token[0].length);
                continue;
            }
            // Grab any horizontal rules (needs to be before ul)
            if (token = lib.hr.exec(md)) {
                console.log("hr" + token[1]);
                tokens.push({
                    rule: 'hr',
                    num: token[1].length
                });
                md = md.substring(token[0].length);
                continue;
            }
            // Grab unordered list
            if (token = lib.ulist.exec(md)) {
                let list = [];
                while (token = lib.ulist.exec(md)) {
                    list.push(token[2]);
                    md = md.substring(token[0].length);
                }
                tokens.push({
                    rule: 'ulist',
                    list: list
                });
                continue;
            }
            // Grab code block
            if (token = lib.codeblock.exec(md)) {
                tokens.push({
                    rule: 'codeblock',
                    lang: token[1],
                    text: token[2]
                });
                md = md.substring(token[0].length);
                continue;
            }
            // Grab free text
            if (token = lib.text.exec(md)) {
                tokens.push({
                    rule: 'text',
                    text: token[1]
                })
                md = md.substring(token[0].length);
                continue;
            }
        }

        return tokens;
    }

    function parseInner(text) {
        let str = '',
            htmlifier = new Htmlifier(),
            token;
        while (text) {
            // Catch inline links
            if (token = lib.link.exec(text)) {
                let link = {
                    rule: 'link',
                    text: token[1],
                    url: token[2]
                }
                text = text.substring(token[0].length);
                str += htmlifier.link(link);
                continue;
            }
            // Catch inline bolding
            if (token = lib.bold.exec(text)) {
                let t = {
                    rule: 'bold',
                    text: token[1]
                }
                text = text.substring(token[0].length);
                str += htmlifier.strong(t);
                continue;
            }
            // Catch image links
            if (token = lib.img.exec(text)) {
                let image = {
                    rule: 'img',
                    text: token[1],
                    src: token[2]
                }
                text = text.substring(token[0].length);
                str += htmlifier.img(image);
            }
            // Catch inline code
            if (token = lib.code.exec(text)) {
                let code = {
                    rule: 'code',
                    text: token[1]
                };
                text = text.substring(token[0].length);
                str += htmlifier.code(code);
            }
            // Catch any lines that begin with a [, *, or _ that were not caught by the rules above
            if (token = /(^[^\[\*_`]+)/.exec(text)) {
                str += token[1];
                text = text.substring(token[0].length);
                continue;
            }
            // Catch remaining
            str += text;
            text = text.substring(text.length);
        }
        return str;
    }

    // Object that takes in tokens and produces the correct HTML as a string
    function Htmlifier() {
        //setup
    }

    Htmlifier.prototype.heading = function (heading) {
        return '<h' + heading.rank + '>' +
            parseInner(heading.text) +
            '</h' + heading.rank + '>';
    }

    Htmlifier.prototype.blockquote = function (quote) {
        return '<blockquote>' +
            parseInner(quote.text) +
            '</blockquote>';
    }

    Htmlifier.prototype.ulist = function (list) {
        return '<ul>' +
            list.list.reduce((result, current) => {
                return result + '<li>' + parseInner(current) + '</li>';
            }, '') +
            '</ul>';
    }

    Htmlifier.prototype.link = function (link) {
        return '<a href="' +
            link.url + '">' +
            parseInner(link.text) +
            '</a>';
    }

    Htmlifier.prototype.img = function (img) {
        return '<img src="' + img.src + '" ' +
            'alt="' + img.text + '">';
    }

    Htmlifier.prototype.strong = function (text) {
        return '<strong>' +
            parseInner(text.text) +
            '</strong>';
    }

    Htmlifier.prototype.hr = function () {
        return '<hr/>';
    }

    Htmlifier.prototype.code = function (code) {
        return '<code>' + code.text + '</code>';
    }

    Htmlifier.prototype.codeblock = function (code) {
        return '<pre><code class="' + code.lang + '">' +
            code.text + '</code></pre>'
    }

    Htmlifier.prototype.paragraph = function (text) {
        return '<p>' +
            parseInner(text.text) +
            '</p>'
    }

    function htmlify(tokens, htmlifier) {
        let str = "";
        for (let token of tokens) {
            switch (token.rule) {
                case 'heading':
                    {
                        str += htmlifier.heading(token);
                        break;
                    }
                case 'blockquote':
                    {
                        str += htmlifier.blockquote(token);
                        break;
                    }
                case 'ulist':
                    {
                        str += htmlifier.ulist(token);
                        break;
                    }
                case 'hr':
                    {
                        str += htmlifier.hr();
                        break;
                    }
                case 'codeblock': 
                    {
                        str += htmlifier.codeblock(token);
                        break;
                    }
                case 'text':
                    {
                        str += htmlifier.paragraph(token);
                        break;
                    }
            }
        }
        return str;
    }

    function marky(md) {
        const htmlifier = new Htmlifier();
        let tokens = tokenize(md);
        return htmlify(tokens, htmlifier);
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = marky;
    } else {
        if (typeof define === 'function' && define.amd) {
            define([], function () {
                return marky;
            });
        } else {
            window.marky = marky;
        }
    }
})();