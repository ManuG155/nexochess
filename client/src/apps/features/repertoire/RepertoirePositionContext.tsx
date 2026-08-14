import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { loadOpeningCatalogue, OpeningCatalogueEntry } from "./openingCatalogue";
import { localizeOpeningName } from "./openingLocalization";
import {
    habitAtFen,
    positionHabitChangeEvent,
    PositionHabit,
    PositionHabitStore,
    readPositionHabits
} from "./playerPositionHabits";
import { catalogueInsightsAtFen } from "./repertoirePositionInsights";
import * as styles from "./repertoirePositionContext.module.css";

type Lang = "en"|"es"|"fr"|"de"|"pt"|"ru"|"zh"|"vi"|"hi"|"mr"|"pl";
type Copy = {
    personalTitle:string;
    personalMove:string;
    reply:string;
    sample:string;
    add:string;
    added:string;
    stockfish:string;
    relatedTitle:string;
    relatedHelp:string;
    next:string;
    addVariant:string;
    more:string;
    less:string;
    habitName:string;
};
const C:Record<Lang,Copy>={
 en:{personalTitle:"Your habit here",personalMove:"Here you usually play {move}",reply:"and your opponents most often reply {move}",sample:"{count} of {total} imported games",add:"Add this line",added:"Line added",stockfish:"Compare with Stockfish",relatedTitle:"Variants and transpositions",relatedHelp:"Other catalogue lines reach this exact position. Open them only when you want more depth.",next:"Next",addVariant:"Add line",more:"Show {count} more",less:"Show less",habitName:"My usual line"},
 es:{personalTitle:"Tu hábito aquí",personalMove:"Aquí sueles jugar {move}",reply:"y tus rivales suelen responder {move}",sample:"{count} de {total} partidas importadas",add:"Añadir esta línea",added:"Línea añadida",stockfish:"Comparar con Stockfish",relatedTitle:"Variantes y transposiciones",relatedHelp:"Otras líneas del catálogo llegan a esta posición exacta. Ábrelas solo cuando quieras profundizar.",next:"Siguiente",addVariant:"Añadir línea",more:"Ver {count} más",less:"Ver menos",habitName:"Mi línea habitual"},
 fr:{personalTitle:"Votre habitude ici",personalMove:"Ici, vous jouez habituellement {move}",reply:"et vos adversaires répondent le plus souvent {move}",sample:"{count} parties sur {total} importées",add:"Ajouter cette ligne",added:"Ligne ajoutée",stockfish:"Comparer avec Stockfish",relatedTitle:"Variantes et transpositions",relatedHelp:"D'autres lignes du catalogue atteignent exactement cette position. Ouvrez-les seulement pour approfondir.",next:"Suite",addVariant:"Ajouter la ligne",more:"Voir {count} de plus",less:"Voir moins",habitName:"Ma ligne habituelle"},
 de:{personalTitle:"Deine Gewohnheit hier",personalMove:"Hier spielst du meistens {move}",reply:"und deine Gegner antworten meist mit {move}",sample:"{count} von {total} importierten Partien",add:"Diese Variante hinzufügen",added:"Variante hinzugefügt",stockfish:"Mit Stockfish vergleichen",relatedTitle:"Varianten und Zugumstellungen",relatedHelp:"Andere Katalogvarianten erreichen exakt diese Stellung. Öffne sie nur, wenn du tiefer gehen willst.",next:"Nächster Zug",addVariant:"Variante hinzufügen",more:"{count} weitere anzeigen",less:"Weniger anzeigen",habitName:"Meine übliche Variante"},
 pt:{personalTitle:"Seu hábito aqui",personalMove:"Aqui você costuma jogar {move}",reply:"e seus adversários costumam responder {move}",sample:"{count} de {total} partidas importadas",add:"Adicionar esta linha",added:"Linha adicionada",stockfish:"Comparar com Stockfish",relatedTitle:"Variantes e transposições",relatedHelp:"Outras linhas do catálogo chegam exatamente a esta posição. Abra-as apenas quando quiser aprofundar.",next:"Próximo",addVariant:"Adicionar linha",more:"Ver mais {count}",less:"Ver menos",habitName:"Minha linha habitual"},
 ru:{personalTitle:"Ваша привычка здесь",personalMove:"В этой позиции вы обычно играете {move}",reply:"а соперники чаще всего отвечают {move}",sample:"{count} из {total} импортированных партий",add:"Добавить вариант",added:"Вариант добавлен",stockfish:"Сравнить со Stockfish",relatedTitle:"Варианты и перестановки ходов",relatedHelp:"Другие линии каталога приводят точно к этой позиции. Открывайте их только для углубления.",next:"Дальше",addVariant:"Добавить вариант",more:"Показать ещё: {count}",less:"Показать меньше",habitName:"Мой обычный вариант"},
 zh:{personalTitle:"你在这里的习惯",personalMove:"在这个局面你通常走 {move}",reply:"而对手最常回应 {move}",sample:"导入的 {total} 盘中有 {count} 盘",add:"添加此线路",added:"线路已添加",stockfish:"与 Stockfish 比较",relatedTitle:"变例与转置",relatedHelp:"其他开局线路也会到达这个完全相同的局面。需要深入时再展开。",next:"下一步",addVariant:"添加线路",more:"再显示 {count} 条",less:"收起",habitName:"我的常用线路"},
 vi:{personalTitle:"Thói quen của bạn ở đây",personalMove:"Ở thế cờ này bạn thường đi {move}",reply:"và đối thủ thường đáp lại {move}",sample:"{count}/{total} ván đã nhập",add:"Thêm biến này",added:"Đã thêm biến",stockfish:"So sánh với Stockfish",relatedTitle:"Biến và chuyển thế",relatedHelp:"Các biến khác trong danh mục cũng dẫn đến đúng thế cờ này. Chỉ mở khi bạn muốn học sâu hơn.",next:"Tiếp theo",addVariant:"Thêm biến",more:"Xem thêm {count}",less:"Thu gọn",habitName:"Biến quen thuộc của tôi"},
 hi:{personalTitle:"यहाँ आपकी आदत",personalMove:"इस स्थिति में आप आम तौर पर {move} चलते हैं",reply:"और प्रतिद्वंद्वी अक्सर {move} से जवाब देते हैं",sample:"आयात की गई {total} बाजियों में {count}",add:"यह लाइन जोड़ें",added:"लाइन जोड़ दी गई",stockfish:"Stockfish से तुलना करें",relatedTitle:"वेरिएशन और ट्रांसपोज़िशन",relatedHelp:"कैटलॉग की दूसरी लाइनें भी इसी सटीक स्थिति तक पहुँचती हैं। गहराई में जाना हो तभी खोलें।",next:"अगली चाल",addVariant:"लाइन जोड़ें",more:"{count} और दिखाएँ",less:"कम दिखाएँ",habitName:"मेरी सामान्य लाइन"},
 mr:{personalTitle:"इथली तुमची सवय",personalMove:"या स्थितीत तुम्ही सहसा {move} खेळता",reply:"आणि प्रतिस्पर्धी बहुतेकदा {move} ने उत्तर देतात",sample:"आयात केलेल्या {total} सामन्यांपैकी {count}",add:"ही लाईन जोडा",added:"लाईन जोडली",stockfish:"Stockfish शी तुलना करा",relatedTitle:"व्हेरिएंट आणि ट्रान्सपोजिशन",relatedHelp:"कॅटलॉगमधील इतर लाईन्सही याच अचूक स्थितीत येतात. अधिक खोल अभ्यास करायचा असेल तेव्हाच उघडा.",next:"पुढची चाल",addVariant:"लाईन जोडा",more:"आणखी {count} दाखवा",less:"कमी दाखवा",habitName:"माझी नेहमीची लाईन"},
 pl:{personalTitle:"Twój nawyk w tej pozycji",personalMove:"Tutaj zwykle grasz {move}",reply:"a przeciwnicy najczęściej odpowiadają {move}",sample:"{count} z {total} zaimportowanych partii",add:"Dodaj ten wariant",added:"Wariant dodany",stockfish:"Porównaj ze Stockfishem",relatedTitle:"Warianty i transpozycje",relatedHelp:"Inne linie katalogu prowadzą dokładnie do tej pozycji. Rozwijaj je tylko wtedy, gdy chcesz wejść głębiej.",next:"Następny ruch",addVariant:"Dodaj wariant",more:"Pokaż jeszcze {count}",less:"Pokaż mniej",habitName:"Mój typowy wariant"}
};

function language(value:string):Lang{const key=value.split("-")[0].toLowerCase() as Lang;return key in C?key:"en";}
function format(template:string,values:Record<string,string|number>){return Object.entries(values).reduce((text,[key,value])=>text.replaceAll(`{${key}}`,String(value)),template);}

interface Props {
    fen: string;
    onAddLine?: (uciMoves: string[], suggestedName: string) => void;
    onAskStockfish: () => void;
}

function RepertoirePositionContext({fen,onAddLine,onAskStockfish}:Props){
    const {i18n}=useTranslation();
    const lang=language(i18n.resolvedLanguage||i18n.language||"en");
    const copy=C[lang];
    const [habitStore,setHabitStore]=useState<PositionHabitStore|undefined>(()=>readPositionHabits());
    const [catalogue,setCatalogue]=useState<OpeningCatalogueEntry[]>([]);
    const [expanded,setExpanded]=useState(false);
    const [added,setAdded]=useState<string>();

    useEffect(()=>{let cancelled=false;void loadOpeningCatalogue().then(items=>{if(!cancelled)setCatalogue(items);});return()=>{cancelled=true;};},[]);
    useEffect(()=>{const refresh=()=>setHabitStore(readPositionHabits());refresh();const event=positionHabitChangeEvent();window.addEventListener(event,refresh);return()=>window.removeEventListener(event,refresh);},[fen]);
    useEffect(()=>{setExpanded(false);setAdded(undefined);},[fen]);

    const habit:PositionHabit|undefined=habitAtFen(fen,habitStore);
    const habitual=habit?.moves[0];
    const share=habit&&habitual&&habit.total?habitual.count/habit.total:0;
    const meaningful=Boolean(habit&&habitual&&habit.total>=5&&habitual.count>=3&&share>=.5);
    const reply=meaningful?habitual?.replies?.[0]:undefined;
    const meaningfulReply=reply&&reply.count>=3?reply:undefined;
    const related=useMemo(()=>catalogue.length?catalogueInsightsAtFen(fen,catalogue,8):[],[fen,catalogue]);
    const visible=expanded?related:related.slice(0,2);

    if(!meaningful&&!related.length)return null;

    function addHabit(){
        if(!habitual||!onAddLine)return;
        const moves=[habitual.uci,...(meaningfulReply?[meaningfulReply.uci]:[])];
        onAddLine(moves,`${copy.habitName} · ${habitual.san}`);
        setAdded("habit");
    }

    return <div className={styles.contextStack}>
        {meaningful&&habit&&habitual&&<section className={styles.personalCard} data-repertoire-tour="personal-habit">
            <div className={styles.contextHeading}><span>◉</span><div><strong>{copy.personalTitle}</strong><small>{habitStore?.username}{habitStore?.platform=="chesscom"?" · Chess.com":habitStore?.platform=="lichess"?" · Lichess":""}</small></div></div>
            <p>{format(copy.personalMove,{move:habitual.san})}{meaningfulReply?` ${format(copy.reply,{move:meaningfulReply.san})}.`:"."}</p>
            <small className={styles.sample}>{format(copy.sample,{count:habitual.count,total:habit.total})}</small>
            <div className={styles.contextActions}>
                {onAddLine&&<button type="button" onClick={addHabit} disabled={added=="habit"}>{added=="habit"?copy.added:copy.add}</button>}
                <button type="button" onClick={onAskStockfish}>{copy.stockfish}</button>
            </div>
        </section>}
        {related.length>0&&<section className={styles.relatedCard} data-repertoire-tour="variants">
            <button type="button" className={styles.relatedToggle} onClick={()=>setExpanded(value=>!value)} aria-expanded={expanded}>
                <div><span>↔</span><div><strong>{copy.relatedTitle}</strong><small>{copy.relatedHelp}</small></div></div><b>{related.length}</b>
            </button>
            <div className={styles.relatedList}>
                {visible.map((item,index)=><article key={`${item.eco}|${item.name}|${item.nextUci}|${index}`}>
                    <div><small>{item.eco}</small><strong>{localizeOpeningName(item.name,lang)}</strong><span>{copy.next}: <b>{item.nextSan}</b></span></div>
                    {onAddLine&&<button type="button" onClick={()=>{onAddLine(item.continuationUci,localizeOpeningName(item.name,lang));setAdded(`related-${index}`);}} disabled={added==`related-${index}`}>{added==`related-${index}`?copy.added:copy.addVariant}</button>}
                </article>)}
            </div>
            {related.length>2&&<button type="button" className={styles.moreButton} onClick={()=>setExpanded(value=>!value)}>{expanded?copy.less:format(copy.more,{count:related.length-2})}</button>}
        </section>}
    </div>;
}

export default RepertoirePositionContext;
