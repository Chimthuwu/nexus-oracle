const fs = require('fs');
let code = fs.readFileSync('apps/web/src/components/CommandBar.tsx', 'utf8');

const replacement = \
      const summoned = Array.isArray(data.cards) ? data.cards : [];
      
      const deckAddMatches = [...responseText.matchAll(/^\\/deck add \\"(.*?)\\"(?: (\\d+))?$/gm)];
      deckAddMatches.forEach(match => {
        const name = match[1];
        const count = parseInt(match[2] || '1', 10);
        const card = summoned.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (card) {
          useOracleStore.getState().addCardToDeck(card, count);
        }
      });
      
      const deckRemoveMatches = [...responseText.matchAll(/^\\/deck remove \\"(.*?)\\"(?: (\\d+))?$/gm)];
      deckRemoveMatches.forEach(match => {
        const name = match[1];
        const count = parseInt(match[2] || '1', 10);
        const deckList = useOracleStore.getState().deckList;
        const deckCard = deckList.find(d => d.card.name.toLowerCase() === name.toLowerCase());
        if (deckCard) {
          useOracleStore.getState().removeCardFromDeck(deckCard.card.id, count);
        }
      });
      
      responseText = responseText.replace(/^\\/deck (add|remove) \\"(.*?)\\"(?: (\\d+))?$/gm, '').trim();

      setResponseText(responseText);
      appendTurn({ role: 'oracle', content: responseText, cards: summoned });
      setCards(summoned);
\;

code = code.replace(
    /const summoned = Array.isArray\(data.cards\) \? data.cards : \[\];\s*setResponseText\(responseText\);\s*appendTurn\(\{ role: 'oracle', content: responseText, cards: summoned \}\);\s*setCards\(summoned\);/,
    replacement.trim()
);
fs.writeFileSync('apps/web/src/components/CommandBar.tsx', code);
