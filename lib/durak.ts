export type Suit = "♠"|"♥"|"♦"|"♣";
export type Rank = "6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K"|"A";
export type Card = { id:string; suit:Suit; rank:Rank };
export type Pair = { attack:Card; defense?:Card };
export type Side = "player"|"bot";
export type GameState = { deck:Card[]; trump:Suit; player:Card[]; bot:Card[]; table:Pair[]; attacker:Side; maxAttacks:number; message:string; winner?:"player"|"bot"|"draw"; botThinking?:boolean };
const suits:Suit[]=["♠","♥","♦","♣"]; const ranks:Rank[]=["6","7","8","9","10","J","Q","K","A"]; const value=(r:Rank)=>ranks.indexOf(r);
export function beats(def:Card, atk:Card, trump:Suit){ if(def.suit===atk.suit) return value(def.rank)>value(atk.rank); return def.suit===trump && atk.suit!==trump; }
function shuffle<T>(a:T[]){const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}
function sortHand(h:Card[],trump:Suit){return [...h].sort((a,b)=>Number(a.suit===trump)-Number(b.suit===trump)||suits.indexOf(a.suit)-suits.indexOf(b.suit)||value(a.rank)-value(b.rank))}
function drawToSix(s:GameState, first:Side){for(const who of [first, first==="player"?"bot":"player"] as Side[]){while(s[who].length<6 && s.deck.length)s[who].push(s.deck.shift()!);s[who]=sortHand(s[who],s.trump)}}
function lowestTrump(hand:Card[],trump:Suit){const t=hand.filter(c=>c.suit===trump).sort((a,b)=>value(a.rank)-value(b.rank));return t[0]}
export function newGame():GameState{let deck=shuffle(suits.flatMap(s=>ranks.map(r=>({id:`${s}${r}-${Math.random().toString(36).slice(2,8)}`,suit:s,rank:r}))));const trump=deck[deck.length-1].suit;const player=sortHand(deck.splice(0,6),trump),bot=sortHand(deck.splice(0,6),trump);const pt=lowestTrump(player,trump),bt=lowestTrump(bot,trump);let attacker:Side="player";if(pt&&bt) attacker=value(pt.rank)<=value(bt.rank)?"player":"bot";else if(!pt&&bt) attacker="bot";return {deck,trump,player,bot,table:[],attacker,maxAttacks:6,message:attacker==="player"?"Your attack":"Bot is thinking...",botThinking:attacker==="bot"}}
function validAttack(s:GameState,c:Card){if(!s.table.length)return true;const rr=new Set(s.table.flatMap(p=>[p.attack.rank,p.defense?.rank]).filter(Boolean));return rr.has(c.rank)}
function remove(h:Card[],id:string){return h.filter(c=>c.id!==id)}
function bestDefense(hand:Card[],atk:Card,trump:Suit){return hand.filter(c=>beats(c,atk,trump)).sort((a,b)=>{const at=a.suit===trump?1:0,bt=b.suit===trump?1:0;return at-bt||value(a.rank)-value(b.rank)})[0]}
function finishCheck(s:GameState){if(s.deck.length)return s;if(!s.player.length&&!s.bot.length)s.winner="draw";else if(!s.player.length)s.winner="player";else if(!s.bot.length)s.winner="bot";return s}
function successfulRound(s:GameState){const old=s.attacker;s.table=[];drawToSix(s,old);s.attacker=old==="player"?"bot":"player";s.maxAttacks=Math.min(6,s[s.attacker==="player"?"bot":"player"].length);s.message=s.attacker==="player"?"Your attack":"Bot is thinking...";s.botThinking=s.attacker==="bot";finishCheck(s);return {...s}}
function defenderTakes(s:GameState,defender:Side){const cards=s.table.flatMap(p=>p.defense?[p.attack,p.defense]:[p.attack]);s[defender].push(...cards);s[defender]=sortHand(s[defender],s.trump);s.table=[];drawToSix(s,s.attacker);s.maxAttacks=Math.min(6,s[defender].length);s.message=s.attacker==="player"?"Bot took. Your attack":"You took. Bot is thinking...";s.botThinking=s.attacker==="bot";finishCheck(s);return {...s}}
export function playerPlay(s0:GameState,id:string):GameState{const s:GameState={...s0,deck:[...s0.deck],player:[...s0.player],bot:[...s0.bot],table:s0.table.map(p=>({...p})),botThinking:false};if(s.winner)return s;const c=s.player.find(x=>x.id===id);if(!c)return s;
 if(s.attacker==="player"){
  if(!validAttack(s,c)||s.table.length>=s.maxAttacks||s.table.some(p=>!p.defense)){s.message="That card cannot be played now";return s}
  s.player=remove(s.player,c.id);s.table.push({attack:c});s.message="Bot is thinking...";s.botThinking=true;return finishCheck(s)
 }
 const pair=s.table.find(p=>!p.defense);if(!pair||!beats(c,pair.attack,s.trump)){s.message="This card does not beat the attack";return s} s.player=remove(s.player,c.id);pair.defense=c;s.message="Defense successful";if(s.table.length>=s.maxAttacks)return successfulRound(s);s.message="Bot is thinking...";s.botThinking=true;return s
}
export function botStep(s0:GameState):GameState{const s:GameState={...s0,deck:[...s0.deck],player:[...s0.player],bot:[...s0.bot],table:s0.table.map(p=>({...p})),botThinking:false};if(s.winner)return s;
 if(s.attacker==="bot"){
  const undefended=s.table.find(p=>!p.defense);
  if(undefended){s.message=`Defend ${undefended.attack.rank}${undefended.attack.suit} or take`;return s}
  const legal=s.bot.filter(c=>validAttack(s,c));
  if(!legal.length||s.table.length>=s.maxAttacks)return successfulRound(s);
  const c=legal.sort((a,b)=>Number(a.suit===s.trump)-Number(b.suit===s.trump)||value(a.rank)-value(b.rank))[0];s.bot=remove(s.bot,c.id);s.table.push({attack:c});s.message=`Defend ${c.rank}${c.suit} or take`;return finishCheck(s)
 }
 const pair=s.table.find(p=>!p.defense);
 if(!pair)return s;
 const d=bestDefense(s.bot,pair.attack,s.trump);
 if(!d){s.message="Bot takes";return defenderTakes(s,"bot")}
 s.bot=remove(s.bot,d.id);pair.defense=d;s.message="Bot defended. Add a matching rank or press Done";return finishCheck(s)
}
export function playerDone(s0:GameState):GameState{const s:GameState={...s0,deck:[...s0.deck],player:[...s0.player],bot:[...s0.bot],table:s0.table.map(p=>({...p})),botThinking:false};if(s.attacker!=="player"||!s.table.length||s.table.some(p=>!p.defense)){s.message="You cannot finish the round yet";return s}return successfulRound(s)}
export function playerTake(s0:GameState):GameState{const s:GameState={...s0,deck:[...s0.deck],player:[...s0.player],bot:[...s0.bot],table:s0.table.map(p=>({...p})),botThinking:false};if(s.attacker!=="bot"||!s.table.some(p=>!p.defense)){s.message="There is nothing to take";return s}return defenderTakes(s,"player")}
export function restartGame(){return newGame()}
