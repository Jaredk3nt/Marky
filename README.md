#Marky

A super simple markdown to HTML parser.
---

Marky was designed as a simple tool to convert markdown files into html documents to help with my personal blog. All you need to do is include Marky in your project and call `marky('some markdown here')`. Marky then spits out a string of HTML that you can then use on your site. The code below is a simple example of how you can upload a markdown file and then render it to the DOM as HTML.

``` javascript
    let file = files[0];
    if(file.length === 0) {
        console.log('no file selected');
        return;
    } else {
        const reader = new FileReader();
        reader.onload = function(event) {
            let frag = document.createRange().createContextualFragment( marky(event.target.result) );
            document.getElementById('marked').appendChild(frag);
        };
        reader.readAsText(file);
    }
```

Marky was built to fit my personal needs so it 'currently' does not support tables, I will hopefully add them later on!
