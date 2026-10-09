# BREAKOUT — arrows/A/D to move. Clear every brick. R to restart.
import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("Code Arcade - Breakout")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 32)
paddle = pygame.Rect(270, 430, 100, 14)
ball = pygame.Rect(312, 310, 14, 14)
ball_x_speed = 4
ball_y_speed = -4
bricks = []
# Supplied loops build three rows of seven bricks.
for row in range(3):
    for column in range(7):
        bricks.append(pygame.Rect(30 + column * 84, 85 + row * 30, 76, 20))
score = 0
lives = 3
game_over = False
won = False
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False
            if event.key == pygame.K_r:
                score = 0
                lives = 3
                game_over = False
                won = False
                paddle.x = 270
                ball.center = (320, 310)
                ball_x_speed = 4
                ball_y_speed = -4
                bricks = []
                for row in range(3):
                    for column in range(7):
                        bricks.append(pygame.Rect(30 + column * 84, 85 + row * 30, 76, 20))

    keys = pygame.key.get_pressed()
    if not game_over and not won:
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            paddle.x = paddle.x - 7
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            paddle.x = paddle.x + 7
        paddle.clamp_ip(screen.get_rect())
        old_ball = ball.copy()
        ball.x = ball.x + ball_x_speed
        ball.y = ball.y + ball_y_speed
        if ball.left <= 0:
            ball.left = 0
            ball_x_speed = -ball_x_speed
        if ball.right >= 640:
            ball.right = 640
            ball_x_speed = -ball_x_speed
        if ball.top <= 60:
            ball.top = 60
            ball_y_speed = -ball_y_speed
        if ball.colliderect(paddle) and ball_y_speed > 0:
            ball.bottom = paddle.top
            ball_y_speed = -ball_y_speed
        for brick in bricks[:]:
            if ball.colliderect(brick):
                bricks.remove(brick)
                score = score + 10
                # Bounce off the side if the ball approached horizontally.
                if old_ball.right <= brick.left or old_ball.left >= brick.right:
                    ball_x_speed = -ball_x_speed
                else:
                    ball_y_speed = -ball_y_speed
                # Use the previous position to prevent getting stuck inside a brick.
                ball = old_ball
                break
        if ball.top > 480:
            lives = lives - 1
            ball.center = (320, 310)
            ball_y_speed = -4
            if lives <= 0:
                game_over = True
        if len(bricks) == 0:
            won = True

    screen.fill((31, 19, 35))
    for brick in bricks:
        colour = (239, 114 + (brick.y - 85), 169)
        pygame.draw.rect(screen, colour, brick, border_radius=3)
    pygame.draw.rect(screen, (219, 176, 255), paddle, border_radius=4)
    pygame.draw.ellipse(screen, (255, 240, 212), ball)
    screen.blit(font.render("Score: " + str(score) + "     Lives: " + str(lives), True, (245, 235, 250)), (20, 20))
    if game_over:
        screen.blit(font.render("Out of lives. Press R to restart.", True, (255, 172, 179)), (140, 230))
    if won:
        screen.blit(font.render("Wall cleared! Press R to replay.", True, (219, 176, 255)), (130, 230))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
