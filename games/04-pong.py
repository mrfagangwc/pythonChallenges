# PONG — Up/Down or W/S to move. First to 5 wins. R to restart.
import pygame
import random

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("Code Arcade - Pong")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 38)
player = pygame.Rect(25, 200, 14, 80)
computer = pygame.Rect(601, 200, 14, 80)
ball = pygame.Rect(312, 232, 16, 16)
ball_x_speed = 5
ball_y_speed = 3
player_score = 0
computer_score = 0
game_over = False
running = True

while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False
            if event.key == pygame.K_r:
                player_score = 0
                computer_score = 0
                game_over = False
                ball.center = (320, 240)
                ball_x_speed = random.choice([-5, 5])
                ball_y_speed = 3
                player.y = 200
                computer.y = 200

    keys = pygame.key.get_pressed()
    if not game_over:
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            player.y = player.y - 6
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            player.y = player.y + 6
        player.clamp_ip(screen.get_rect())
        # The computer follows the ball, more slowly than the player.
        if computer.centery < ball.centery:
            computer.y = computer.y + 3
        if computer.centery > ball.centery:
            computer.y = computer.y - 3
        computer.clamp_ip(screen.get_rect())
        ball.x = ball.x + ball_x_speed
        ball.y = ball.y + ball_y_speed
        if ball.top <= 0:
            ball.top = 0
            ball_y_speed = -ball_y_speed
        if ball.bottom >= 480:
            ball.bottom = 480
            ball_y_speed = -ball_y_speed
        if ball.colliderect(player) and ball_x_speed < 0:
            ball.left = player.right
            ball_x_speed = -ball_x_speed
        if ball.colliderect(computer) and ball_x_speed > 0:
            ball.right = computer.left
            ball_x_speed = -ball_x_speed
        if ball.right < 0:
            computer_score = computer_score + 1
            ball.center = (320, 240)
            ball_x_speed = 5
            ball_y_speed = random.choice([-3, 3])
        if ball.left > 640:
            player_score = player_score + 1
            ball.center = (320, 240)
            ball_x_speed = -5
            ball_y_speed = random.choice([-3, 3])
        if player_score >= 5 or computer_score >= 5:
            game_over = True

    screen.fill((15, 30, 32))
    for y in range(0, 480, 28):
        pygame.draw.rect(screen, (42, 66, 67), (318, y, 4, 14))
    pygame.draw.rect(screen, (113, 239, 183), player)
    pygame.draw.rect(screen, (249, 217, 139), computer)
    pygame.draw.ellipse(screen, (245, 250, 246), ball)
    label = str(player_score) + "    :    " + str(computer_score)
    screen.blit(font.render(label, True, (245, 250, 246)), (245, 25))
    if game_over:
        message = "Computer wins. Press R to retry."
        if player_score >= 5:
            message = "You win! Press R to replay."
        screen.blit(font.render(message, True, (113, 239, 183)), (95, 235))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
