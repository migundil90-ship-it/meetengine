
(function(){
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var bar = document.getElementById('bar');
  var count = document.getElementById('count');
  var prev = document.getElementById('prev');
  var next = document.getElementById('next');
  var hint = document.getElementById('hint');
  var i = 0, lock = false;

  function pad(n){ return (n<10?'0':'')+n; }

  function go(n, push){
    n = Math.max(0, Math.min(slides.length-1, n));
    if(n === i && push !== 'init') return;
    slides[i].classList.remove('active');
    i = n;
    slides[i].classList.add('active');
    slides[i].scrollTop = 0;
    bar.style.width = ((i+1)/slides.length*100) + '%';
    count.innerHTML = '<b>'+pad(i+1)+'</b> / '+slides.length;
    prev.disabled = (i===0);
    next.disabled = (i===slides.length-1);
    if(push !== 'init') history.replaceState(null,'','#'+(i+1));
    if(i>0) hint.classList.add('gone');
  }

  next.addEventListener('click', function(){ go(i+1); });
  prev.addEventListener('click', function(){ go(i-1); });

  document.addEventListener('keydown', function(e){
    if(['ArrowRight','ArrowDown','PageDown',' '].indexOf(e.key)>-1){ e.preventDefault(); go(i+1); }
    else if(['ArrowLeft','ArrowUp','PageUp'].indexOf(e.key)>-1){ e.preventDefault(); go(i-1); }
    else if(e.key==='Home'){ go(0); }
    else if(e.key==='End'){ go(slides.length-1); }
    else if(e.key==='f'||e.key==='F'){
      if(!document.fullscreenElement){ document.documentElement.requestFullscreen(); } else { document.exitFullscreen(); }
    }
  });

  // Колесо / трекпад
  var acc = 0, t;
  window.addEventListener('wheel', function(e){
    var s = slides[i];
    if(s.scrollHeight > s.clientHeight + 4){
      var atTop = s.scrollTop <= 0, atBottom = s.scrollTop + s.clientHeight >= s.scrollHeight - 2;
      if((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) return;
    }
    if(lock) return;
    acc += e.deltaY;
    clearTimeout(t); t = setTimeout(function(){ acc = 0; }, 180);
    if(Math.abs(acc) > 60){
      lock = true; go(acc > 0 ? i+1 : i-1); acc = 0;
      setTimeout(function(){ lock = false; }, 620);
    }
  }, {passive:true});

  // Свайп
  var x0=null, y0=null;
  window.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, {passive:true});
  window.addEventListener('touchend', function(e){
    if(x0===null) return;
    var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
    if(Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? i+1 : i-1);
    x0 = null;
  }, {passive:true});

  var start = parseInt((location.hash||'').replace('#',''),10);
  go(isNaN(start) ? 0 : start-1, 'init');
})();
