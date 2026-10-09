# CATCH THE COIN — arrows or A/D to move. Catch 10 coins. R to replay.
# The Pygame window and repeating game loop are provided for you.
import pygame
import random

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("Code Arcade - Catch the Coin")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 32)

player = pygame.Rect(280, 410, 80, 18)
coin = pygame.Rect(random.randint(20, 600), -30, 20, 20)
player_speed = 6
coin_speed = 4
score = 0
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
                won = False
                player.x = 280
                coin.y = -30
                coin.x = random.randint(20, 600)

    keys = pygame.key.get_pressed()
    if not won:
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player.x = player.x - player_speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player.x = player.x + player_speed
        player.clamp_ip(screen.get_rect())
        coin.y = coin.y + coin_speed

        if player.colliderect(coin):
            score = score + 1
            coin.y = -30
            coin.x = random.randint(20, 600)
        if coin.y > 480:
            coin.y = -30
            coin.x = random.randint(20, 600)
        if score >= 10:
            won = True

    screen.fill((16, 24, 35))
    pygame.draw.line(screen, (35, 55, 65), (0, 438), (640, 438), 2)
    pygame.draw.rect(screen, (181, 251, 104), player, border_radius=6)
    pygame.draw.circle(screen, (255, 207, 83), coin.center, 10)
    screen.blit(font.render("Coins: " + str(score) + " / 10", True, (240, 245, 250)), (20, 20))
    screen.blit(font.render("Left / Right to catch coins", True, (165, 185, 200)), (20, 55))
    if won:
        screen.blit(font.render("10 coins! You win. Press R to replay.", True, (181, 251, 104)), (100, 230))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
