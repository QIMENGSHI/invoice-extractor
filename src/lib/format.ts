export function formatMoney(
    amount: number | null | undefined, 
    currency: string | null | undefined,

):string | null{
    if (amount === null || amount === undefined || currency === undefined || currency === null) {
        return null;
    }
    const value = amount.toFixed(2);
    return currency ? `${currency} ${value}` : value;
}

export function formatDate(
    date: string | null | undefined,
):string | null {
    if (date === null || date === undefined) {
        return null;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return date; // return the original string if it's not a valid date
    }
    return d.toLocaleDateString();
}

