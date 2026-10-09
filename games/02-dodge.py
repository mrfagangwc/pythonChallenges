# DODGE! — arrows or A/D to move. Avoid falling blocks. R to restart.
import pygame
import random

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("Code Arcade - Dodge!")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 32)
player = pygame.Rect(300, 414, 36, 36)
# Each rectangle stores one obstacle's position and size.
obstacles = [pygame.Rect(80, -60, 38, 38),
             pygame.Rect(300, -230, 38, 38),
             pygame.Rect(500, -400, 38, 38)]
player_speed = 6
fall_speed = 4
score = 0
frames = 0
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
                player.x = 300
                score = 0
                frames = 0
                game_over = False
                for index in range(len(obstacles)):
                    obstacles[index].x = random.randint(0, 602)
                    obstacles[index].y = -60 - index * 170

    keys = pygame.key.get_pressed()
    if not game_over:
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player.x = player.x - player_speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player.x = player.x + player_speed
        player.clamp_ip(screen.get_rect())
        frames = frames + 1
        score = frames // 60
        # The supplied loop moves each obstacle in the list.
        for obstacle in obstacles:
            obstacle.y = obstacle.y + fall_speed
            if obstacle.y > 480:
                obstacle.y = random.randint(-240, -40)
                obstacle.x = random.randint(0, 602)
            if player.colliderect(obstacle):
                game_over = True

    screen.fill((24, 18, 34))
    for x in range(0, 640, 40):
        pygame.draw.line(screen, (39, 31, 49), (x, 0), (x, 480))
    pygame.draw.rect(screen, (170, 145, 255), player, border_radius=5)
    for obstacle in obstacles:
        pygame.draw.rect(screen, (255, 112, 116), obstacle, border_radius=4)
    screen.blit(font.render("Survived: " + str(score) + " seconds", True, (245, 240, 250)), (20, 20))
    if game_over:
        screen.blit(font.render("Game over! Press R to try again.", True, (255, 190, 195)), (115, 225))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
