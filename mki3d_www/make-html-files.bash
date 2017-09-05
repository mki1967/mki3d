# make Progressive Web App
cat \
    html/html-prefix.html \
    html/mki3d-head.html \
    html/body-prefix-scripts.html \
    html/divs/*.html \
    html/body-html-suffix.html \
    > mki3d.html

# make Chrome App
cat \
    html/html-prefix.html \
    html/index-head.html \
    html/body-prefix-scripts.html \
    html/divs/*.html \
    html/body-html-suffix.html \
    > index.html


