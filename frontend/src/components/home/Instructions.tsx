import { Box } from "@fuel-ui/react"
import { cssObj } from "@fuel-ui/css"

export default function Instructions(){
    return (
        <Box css={styles.box}>
        <h3>Instructions:</h3>
        <p style={styles.text}>
        Use WASD or arrow keys to move around the game.
        </p>
        <p style={styles.text}>
        Grow and sell tomatoes to become a Sway Farm hero.
        </p>
        </Box>
    )
}

const styles = {
    box: cssObj({
        padding: '$4 0',
        fontFamily: 'pressStart2P',
        color: "#aaa",
        maxWidth: '800px'
    }),
    text: {
        fontSize: '14px'
    }
}