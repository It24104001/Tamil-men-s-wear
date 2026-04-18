export const translations = {
  en: {
    featured: 'Featured Collection',
    search: 'Search products...',
    profile: 'Profile',
    name: 'Name',
    email: 'Email',
    loyaltyPoints: 'Loyalty Points',
    logout: 'Logout',
    language: 'Tamil Language',
    addToCart: 'Add To Cart',
    smartRec: '🧠 Smart Recommendation: Size',
    selectSize: 'Select Size',
    yourCart: 'Your Cart',
    total: 'Total',
    checkout: 'Proceed to Checkout',
    emptyCart: 'Your cart is empty.'
  },
  ta: {
    featured: 'சிறப்பு தொகுப்பு',
    search: 'ஆடை தேடுக...',
    profile: 'சுயவிவரம்',
    name: 'பெயர்',
    email: 'மின்னஞ்சல்',
    loyaltyPoints: 'விசுவாச புள்ளிகள்',
    logout: 'வெளியேறு',
    language: 'English Language',
    addToCart: 'வண்டியில் சேர்',
    smartRec: '🧠 சிறந்த அளவு பரிந்துரை:',
    selectSize: 'அளவை தேர்வு செய்',
    yourCart: 'உங்கள் வண்டி',
    total: 'மொத்தம்',
    checkout: 'பணம் செலுத்த தொடரவும்',
    emptyCart: 'உங்கள் வண்டி காலியாக உள்ளது.'
  }
};

export const t = (lang, key) => {
  return translations[lang]?.[key] || translations['en'][key] || key;
};
