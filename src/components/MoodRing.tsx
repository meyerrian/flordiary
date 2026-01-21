'use client'

export function MoodRing({ segments }: { segments: { color: string; percentage: number }[] }) {
    if (!segments || segments.length === 0) return null

    // Calculate conic gradient string
    let gradient = 'conic-gradient('
    let currentDeg = 0
    segments.forEach((seg, i) => {
        const deg = (seg.percentage / 100) * 360
        gradient += `${seg.color} ${currentDeg}deg ${currentDeg + deg}deg`
        currentDeg += deg
        if (i < segments.length - 1) gradient += ', '
    })
    gradient += ')'

    return (
        <div style={{
            position: 'relative',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: gradient,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
        }}>
            {/* Inner circle to make it a ring */}
            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'var(--bg-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1
            }}>
                <span style={{ fontSize: '2.5rem' }}>☯️</span>
            </div>
        </div>
    )
}
