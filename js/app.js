document.addEventListener('DOMContentLoaded', function(){
  if(!(window.jQuery && window.Chess && window.Chessboard)){
    return
  }
  var board = null
  var game = new Chess()
  var engine = new PixenaEngine({depth:5, timeLimit:2})
  var movesEl = document.getElementById('moves')
  var statusEl = document.getElementById('status')
  var logEl = document.getElementById('log')
  function log(msg){ var t = new Date().toLocaleTimeString(); logEl.textContent = '['+t+'] PixenaChess AI '+msg+'\n'+logEl.textContent }
  function updateMoves(){ var history = game.history ? game.history({verbose:true}) : []; var html=''; for(var i=0;i<history.length;i+=2){ var num=(i/2)+1; var w=history[i]?history[i].san:''; var b=history[i+1]?history[i+1].san:''; html += '<div class="row"><span class="num">'+num+'.</span><span>'+w+'</span><span>'+b+'</span></div>' } movesEl.innerHTML = html }
  function updateStatus(){ if(game.in_checkmate && game.in_checkmate()) statusEl.textContent='Мат. Игра окончена'; else if(game.in_draw && game.in_draw()) statusEl.textContent='Ничья'; else statusEl.textContent = (game.turn && game.turn()==='w' ? 'Ход белых' : 'Ход чёрных') }
  function highlight(from,to){ try{ var $from = document.querySelector('.square-'+from); var $to = document.querySelector('.square-'+to); if($from) $from.classList.add('square-highlight'); if($to) $to.classList.add('square-highlight'); setTimeout(function(){ if($from) $from.classList.remove('square-highlight'); if($to) $to.classList.remove('square-highlight'); },600) }catch(e){} }
  function doAIMove(){ var fen = game.fen(); log('запрашивает ход для '+fen); setTimeout(function(){ var mv = engine.bestMove(fen); if(!mv){ log('не нашёл ход'); return } var from = mv.slice(0,2); var to = mv.slice(2,4); game.move({from:from,to:to,promotion:'q'}); if(board) board.position(game.fen()); highlight(from,to); log('сыграл: '+mv); updateMoves(); updateStatus() }, 30) }
  function onDrop(source,target){ var move = null; try{ move = game.move({from:source,to:target,promotion:'q'}) }catch(e){ move = null } if(move === null) return 'snapback'; var prevFen = game.fen(); log('оппонент сыграл: '+move.san); engine.learnOpponent(prevFen, move.from+move.to); updateMoves(); updateStatus(); highlight(move.from, move.to); setTimeout(function(){ if(!(game.game_over && game.game_over())) doAIMove() }, 120); }
  function onSnapEnd(){ if(board) board.position(game.fen()) }
  var config = { draggable:true, position:'start', onDrop:onDrop, onSnapEnd:onSnapEnd, orientation:'white' }
  board = Chessboard('board', config)
  document.getElementById('newGame').addEventListener('click', function(){ var aiFirst = document.getElementById('aiWhite').checked; game.reset(); board.start(); engine = new PixenaEngine({depth:5, timeLimit:2}); log('Новая партия. AI ходит первым: '+(aiFirst?'Да':'Нет')); updateMoves(); updateStatus(); if(aiFirst){ setTimeout(doAIMove,200) } })
  document.getElementById('undo').addEventListener('click', function(){ if(game.undo) { game.undo(); game.undo() } if(board) board.position(game.fen()); updateMoves(); updateStatus(); log('Ход отменён') })
  updateMoves(); updateStatus(); var aiFirst = true; document.getElementById('aiWhite').checked = aiFirst; if(aiFirst) setTimeout(doAIMove,300)
})