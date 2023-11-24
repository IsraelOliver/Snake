
//ferramentas
const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

//chamando os objetos
const score = document.querySelector('.score-value')
const finalScore = document.querySelector('.final-score > span')
const menu = document.querySelector('.menu-screen')
const buttonPlay = document.querySelector('.btn-play')
const highScoreMax = document.querySelector('.highscore')
const speed = document.querySelector('.speed')


//variaveis padrao
const size = 30
let highscore = 0
let interval = 200

//variavel da posição inicial da cobra
const initialPosition ={ x: 300, y: 300 }

//posição inicial
let snake = [initialPosition]

//pontuação maxima
const setHighScore = (num) => {
    if (highscore < num) {
        highscore = num;
        localStorage.setItem('highscore', `${num}`)
        highScoreMax.innerText = highscore
    }
}

if(!localStorage.getItem('highscore')) {
    setHighScore(0)
} else {
    highscore = +localStorage.getItem('highscore');
    highScoreMax.innerText = highscore;
}

//marcador de pontos
const incrementScore = () => {
    score.innerText = +score.innerText + 10
    setHighScore(+score.innerText)
    speed.innerText = 205 - interval
}

//variaveis de direção e do loop
let direction, loopid

//audio ao comer a comida
const audio = new Audio('../assets/audio.mp3')


//gerador de numero aleatorio
const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}


//gerador de numero aleatorio multiplo de 30
const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / 30) * 30
}


//gerador de cor aleatoria
const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

//gerador da comida
const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}


//comida
const drawFood = () => {
    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 10
    ctx.fillStyle = food.color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

//cobra
const drawSnake = () => {
    ctx.fillStyle = '#7c183c'
    
    snake.forEach((position, index) => {
        if(index == snake.length - 1) {
            ctx.fillStyle = '#d53c6a'
        }

        ctx.fillRect(position.x, position.y, size, size)
    })
}

//movimentação da cobra
const moveSnake = () => {
    if (!direction) return

    const head = snake[snake.length - 1]

    if (direction == 'right') {
        snake.push({ x: head.x + size, y: head.y})
    }

    if (direction == 'left') {
        snake.push({ x: head.x - size, y: head.y})
    }
    
    if (direction == 'down') {
        snake.push({ x: head.x, y: head.y + size})
    }

    if (direction == 'up') {
        snake.push({ x: head.x, y: head.y - size})
    }

    snake.shift()
}

//grade
const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = '#1f0510'

    for (let i = 30; i < canvas.width; i += 30) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, 600)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(600, i)
        ctx.stroke()
    }
}


//checagem de comida
const checkEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        snake.push(head)
        audio.play()

        let x = randomPosition()
        let y = randomPosition()

        while (snake.find((position) => position.x == x && position.y ==y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()

        if (interval > 55) {
            interval -= 5
        }
    }
}

//checagem de colisão
const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision = head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    if (wallCollision || selfCollision) {
        gameOver()
    }
}

//gamer hover
const gameOver = () => {
    direction = undefined

    menu.style.display = 'flex'
    finalScore.innerText = score.innerText
    canvas.style.filter = 'blur(2px)'
}

//motor
const gameLoop = () => {
    clearInterval(loopid)

    ctx.clearRect(0, 0, 600, 600)
    drawGrid()
    drawFood()
    moveSnake()
    drawSnake()
    checkEat()
    checkCollision()

    loopid = setTimeout(() => {
        gameLoop()
    }, interval)
}
gameLoop()

//evento de teclas
document.addEventListener('keydown', ({ key }) => {
    if (key == 'd' && direction != 'left') {
        direction = 'right'
    }

    if (key == 'a' && direction != 'right') {
        direction = 'left'
    }

    if (key == 's' && direction != 'up') {
        direction = 'down'
    }

    if (key == 'w' && direction != 'down') {
        direction = 'up'
    }
})

//evento de reinicio
buttonPlay.addEventListener('click', () => {
    score.innerText = '00'
    menu.style.display = 'none'
    canvas.style.filter = 'none'
    interval = 200

    snake = [initialPosition]
})