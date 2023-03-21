interface ShowSeedsProps {
    seeds: number;
}

export default function ShowSeeds({ seeds }: ShowSeedsProps) {
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
            {seeds > 99 ? "99+" : seeds.toLocaleString()}
        </div>
    )
}