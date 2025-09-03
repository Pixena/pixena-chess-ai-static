function PixenaEngine(options){
  options = options || {}
  this.maxDepth = options.depth || 5
  this.timeLimit = options.timeLimit || 2
  this.pieceValues = {p:100,n:320,b:330,r:500,q:900,k:20000}
  this.pst = {}
  this.tt = {}
  this.history = {}
  this.opponent = {}
}
PixenaEngine.prototype.evaluate = function(board){
  var material = 0
  var pst = 0
  try{
    var moves = board.moves()
    for(var i=0;i<64;i++){}
    var mobility = moves.length
    return mobility
  }catch(e){ return 0 }
}
PixenaEngine.prototype.orderMoves = function(board, moves, fen){
  var scored = []
  var predicted = this.opponent[fen] ? Object.keys(this.opponent[fen]).sort(function(a,b){return this.opponent[fen][b]-this.opponent[fen][a]}.bind(this)).slice(0,5) : []
  for(var i=0;i<moves.length;i++){
    var m = moves[i]
    var score = 0
    if(m.flags && m.flags.indexOf('c')!==-1) score += 100000
    var key = m.from + m.to
    score += this.history[key] || 0
    if(predicted.indexOf(m.from+m.to)!==-1) score += 5000
    scored.push([score,m])
  }
  scored.sort(function(a,b){return b[0]-a[0]})
  return scored.map(function(x){return x[1]})
}
PixenaEngine.prototype.quiescence = function(board, alpha, beta, fen){
  var stand = this.evaluate(board)
  if(stand >= beta) return beta
  if(alpha < stand) alpha = stand
  var captures = board.moves({verbose:true}).filter(function(m){return m.flags && m.flags.indexOf('c')!==-1})
  captures = captures.sort(function(a,b){return (b.captured?100:0)-(a.captured?100:0)})
  for(var i=0;i<captures.length;i++){
    if((Date.now()-this._start) > this.timeLimit*1000) break
    board.move(captures[i])
    var score = -this.quiescence(board, -beta, -alpha, board.fen())
    board.undo()
    if(score >= beta) return beta
    if(score > alpha) alpha = score
  }
  return alpha
}
PixenaEngine.prototype.search = function(board, depth, alpha, beta, fen){
  if((Date.now()-this._start) > this.timeLimit*1000) throw 'timeout'
  this._nodes = (this._nodes||0)+1
  var entry = this.tt[fen]
  if(entry && entry.depth >= depth){
    if(entry.flag==='EXACT') return [entry.score, entry.move]
    if(entry.flag==='LOWER' && entry.score > alpha) alpha = entry.score
    if(entry.flag==='UPPER' && entry.score < beta) beta = entry.score
    if(alpha >= beta) return [entry.score, entry.move]
  }
  if(depth===0) return [this.quiescence(board, alpha, beta, fen), null]
  var moves = board.moves({verbose:true})
  moves = this.orderMoves(board, moves, fen)
  var bestMove = null
  for(var i=0;i<moves.length;i++){
    var m = moves[i]
    board.move(m)
    var res = this.search(board, depth-1, -beta, -alpha, board.fen())
    var score = -res[0]
    board.undo()
    if(score > alpha){ alpha = score; bestMove = m }
    if(alpha >= beta){
      var hk = m.from + m.to
      this.history[hk] = (this.history[hk]||0) + (1<<depth)
      break
    }
  }
  var flag = bestMove ? 'EXACT' : 'UPPER'
  this.tt[fen] = {depth: depth, score: alpha, flag: flag, move: bestMove}
  return [alpha, bestMove]
}
PixenaEngine.prototype.learnOpponent = function(fenBefore, uciMove){
  this.opponent[fenBefore] = this.opponent[fenBefore] || {}
  this.opponent[fenBefore][uciMove] = (this.opponent[fenBefore][uciMove]||0) + 1
}
PixenaEngine.prototype.bestMove = function(fen){
  var board = new Chess(fen)
  this._start = Date.now()
  this._nodes = 0
  var best = null
  try{
    for(var d=1; d<=this.maxDepth; d++){
      var res = this.search(board, d, -9999999, 9999999, board.fen())
      if(res[1]) best = res[1]
      if((Date.now()-this._start) > this.timeLimit*1000) break
    }
  }catch(e){}
  return best ? best.from+best.to : null
}