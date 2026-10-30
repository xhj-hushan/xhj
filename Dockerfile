FROM nginx:latest
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY index.html projects.html blog.html life.html about.html styles.css script.js game-props.js music-demo.js table-focus.js life-gallery.js /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY shenghuo/ /usr/share/nginx/html/shenghuo/
COPY music/ /usr/share/nginx/html/music/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
