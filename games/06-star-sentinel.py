# STAR SENTINEL — original shapes, no external images.
# Arrows/A/D move; Space fires. Clear all drones. R restarts.
import pygame

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("Code Arcade - Star Sentinel")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 32)
player = pygame.Rect(300, 425, 36, 24)
enemies = []
for row in range(3):
    for column in range(6):
        enemies.append(pygame.Rect(80 + column * 75, 80 + row * 45, 30, 24))
bullets = []
enemy_speed = 2
cooldown = 0
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
                player.x = 300
                score = 0
                lives = 3
                game_over = False
                won = False
                cooldown = 0
                enemy_speed = 2
                bullets = []
                enemies = []
                for row in range(3):
                    for column in range(6):
                        enemies.append(pygame.Rect(80 + column * 75, 80 + row * 45, 30, 24))

    keys = pygame.key.get_pressed()
    if not game_over and not won:
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player.x = player.x - 6
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player.x = player.x + 6
        player.clamp_ip(screen.get_rect())
        if cooldown > 0:
            cooldown = cooldown - 1
        if keys[pygame.K_SPACE] and cooldown == 0:
            bullets.append(pygame.Rect(player.centerx - 3, player.top, 6, 14))
            cooldown = 16

        # Move the entire remaining fleet together.
        reached_edge = False
        for enemy in enemies:
            enemy.x = enemy.x + enemy_speed
            if enemy.left <= 10 or enemy.right >= 630:
                reached_edge = True
        if reached_edge:
            enemy_speed = -enemy_speed
            for enemy in enemies:
                enemy.y = enemy.y + 18

        for bullet in bullets[:]:
            bullet.y = bullet.y - 8
            if bullet.bottom < 0:
                bullets.remove(bullet)
            else:
                for enemy in enemies[:]:
                    if bullet.colliderect(enemy):
                        bullets.remove(bullet)
                        enemies.remove(enemy)
                        score = score + 10
                        break

        # A drone reaching your row costs a life and is removed.
        for enemy in enemies[:]:
            if enemy.bottom >= player.top:
                enemies.remove(enemy)
                lives = lives - 1
                if lives <= 0:
                    game_over = True
                    break
        if len(enemies) == 0 and not game_over:
            won = True

    screen.fill((14, 18, 38))
    for star in range(35):
        pygame.draw.circle(screen, (61, 72, 105), ((star * 113) % 640, (star * 79) % 480), 1)
    pygame.draw.polygon(screen, (129, 173, 255), [player.midtop, player.bottomleft, player.bottomright])
    for enemy in enemies:
        pygame.draw.rect(screen, (245, 152, 220), enemy, border_radius=4)
        pygame.draw.rect(screen, (14, 18, 38), (enemy.x + 6, enemy.y + 8, 18, 5))
    for bullet in bullets:
        pygame.draw.rect(screen, (185, 255, 231), bullet)
    screen.blit(font.render("Score: " + str(score) + "     Lives: " + str(lives), True, (230, 235, 255)), (20, 20))
    if game_over:
        screen.blit(font.render("Fleet reached you! R to try again.", True, (245, 152, 220)), (120, 250))
    if won:
        screen.blit(font.render("Sector clear! R to patrol again.", True, (185, 255, 231)), (140, 250))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
