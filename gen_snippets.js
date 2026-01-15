let syncls={ v:"Value", f:"Function", m:"Modifier", d:"Modifier2", n:"Number", g:"Gets", p:"Paren", b:"Bracket", k:"Brace", l:"Ligature", n:"Nothing", s:"Separator", c:"Comment", a:"String" };
let keydesc='f+Conjugate;Add_f-Negate;Subtract_f×Sign;Multiply_f÷Reciprocal;Divide_f⋆Exponential;Power_f√Square Root;Root_f⌊Floor;Minimum_f⌈Ceiling;Maximum_f∧Sort Up;And_f∨Sort Down;Or_f¬Not;Span_f|Absolute Value;Modulus_f≤Less Than or Equal to_f<Enclose;Less Than_f>Merge;Greater Than_f≥Greater Than or Equal to_f=Rank;Equals_f≠Length;Not Equals_f≡Depth;Match_f≢Shape;Not Match_f⊣Identity;Left_f⊢Identity;Right_f⥊Deshape;Reshape_f∾Join;Join to_f≍Solo;Couple_f↑Prefixes;Take_f↓Suffixes;Drop_f↕Range;Windows_f»Shift Before_f«Shift After_f⌽Reverse;Rotate_f⍉Transpose;Reorder axes_f/Indices;Replicate_f⍋Grade Up;Bins Up_f⍒Grade Down;Bins Down_f⊏First Cell;Select_f⊑First;Pick_f⊐Classify;Index of_f⊒Occurrence Count;Progressive Index of_f∊Mark First;Member of_f⍷Deduplicate;Find_f⊔Group Indices;Group_f!Assert;Assert with message_m˙Constant_m˜Self/Swap_d∘Atop_d○Over_d⊸Before/Bind_d⟜After/Bind_d⌾Under_d⊘Valences_d◶Choose_d⎉Rank_m˘Cells_d⚇Depth_m¨Each_m⌜Table_d⍟Repeat_m⁼Undo_m´Fold_m˝Insert_m`Scan_g←Define_g⇐Export_g↩Change_g→Return_s⋄Separator_s,Separator_p(Begin expression_p)End expression_k{Begin block_k}End block_b⟨Begin list_b⟩End list_l‿Strand_n·Nothing_v•System_v𝕨Left argument_f𝕎Left argument (as function)_v𝕩Right argument_f𝕏Right argument (as function)_v𝕗Modifier left operand (as subject)_f𝔽Modifier left operand_v𝕘2-modifier right operand (as subject)_f𝔾2-modifier right operand_v𝕤Current function (as subject)_f𝕊Current function_m𝕣Current modifier_n¯Minus_nπPi_n∞Infinity_a@Null character_c#Comment'.split(/[\n_]/);
let kk=Array.from('`123456890-=~!@#$%^&*()_+qwertuiop[]QWERTIOP{}asdfghjkl;ASFGHKL:"zxcvbm,./XVBM<>? \'');
let kv=Array.from('˜˘¨⁼⌜´˝∞¯•÷×¬⎉⚇⍟◶⊘⎊⍎⍕⟨⟩√⋆⌽𝕨∊↑∧⊔⊏⊐π←→↙𝕎⍷𝕣⍋⊑⊒⍳⊣⊢⍉𝕤↕𝕗𝕘⊸∘○⟜⋄↖𝕊𝔽𝔾«⌾»·˙⥊𝕩↓∨⌊≡∾≍≠𝕏⍒⌈≢≤≥⇐‿↩');
let keys={}, revkeys={}, primhelp={};
kk.map((k,i)=>{keys[k]=kv[i];revkeys[kv[i]]=k;});
let x = keydesc.map(d=>{
  let s = syncls[d[0]];
  let c = Array.from(d)[1];
  let t = d.slice(1+c.length).replace(";",", ");
  let k = revkeys[c];
  primhelp[c] = t;

  return [t,s,c,k];
});
//console.log(JSON.stringify(revkeys));

let shorts={}
for(let i of x){
a=i[1]+": "+i[0];
	shorts[a]={};
	shorts[a]["body"] = [i[2]];
	if(i[3]){
	shorts[a]["prefix"] = ["\\"+i[3]];
	} else {
	shorts[a]["prefix"] = [i[2]];
}
}
console.log(JSON.stringify(shorts));
