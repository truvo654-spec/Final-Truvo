import React, { createContext, useContext } from 'react';
export const JournalCurrency = createContext('USD');
export const formatMoney = (n:number,currency='USD',dp=2) => new Intl.NumberFormat('en-US',{style:'currency',currency,minimumFractionDigits:dp,maximumFractionDigits:dp,signDisplay:'exceptZero'}).format(n);
export const useMoney = () => { const currency=useContext(JournalCurrency);return (n:number,dp=2)=>formatMoney(n,currency,dp); };
