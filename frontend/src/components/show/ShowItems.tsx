interface ShowItemsProps {
    items: number;
}

export default function ShowItems({ items }: ShowItemsProps) {
    return (
        <div style={{
            fontSize: '10px',
            width: '35px',
            height: '35px',
            backgroundColor: 'rgba(255,255,255,0.5)',
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center'
        }}>
            {items > 99 ? "99+" : items}
        </div>
    )
}