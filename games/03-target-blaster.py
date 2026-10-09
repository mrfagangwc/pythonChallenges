# TARGET BLASTER — arrows/A/D to move; Space to fire. Hit 12 targets.
import pygame
import random

pygame.init()
screen = pygame.display.set_mode((640, 480))
pygame.display.set_caption("Code Arcade - Target Blaster")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 32)
player = pygame.Rect(300, 420, 40, 24)
# An empty list will hold the rectangles for bullets we fire.
bullets = []
targets = [pygame.Rect(80, 100, 38, 38),
           pygame.Rect(280, 150, 38, 38),
           pygame.Rect(480, 90, 38, 38)]
score = 0
cooldown = 0
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
                bullets = []
                cooldown = 0
                player.x = 300
                for target in targets:
                    target.x = random.randint(20, 580)
                    target.y = random.randint(80, 230)

    keys = pygame.key.get_pressed()
    if not won:
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player.x = player.x - 6
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player.x = player.x + 6
        player.clamp_ip(screen.get_rect())
        if cooldown > 0:
            cooldown = cooldown - 1
        if keys[pygame.K_SPACE] and cooldown == 0:
            bullets.append(pygame.Rect(player.centerx - 3, player.top, 6, 16))
            cooldown = 15
        # A copy of the list lets us safely remove bullets during this loop.
        for bullet in bullets[:]:
            bullet.y = bullet.y - 8
            if bullet.bottom < 0:
                bullets.remove(bullet)
            else:
                for target in targets:
                    if bullet.colliderect(target):
                        score = score + 1
                        target.x = random.randint(20, 580)
                        target.y = random.randint(80, 230)
                        bullets.remove(bullet)
                        # Stop checking this bullet after its first hit.
                        break
        if score >= 12:
            won = True

    screen.fill((14, 27, 39))
    pygame.draw.rect(screen, (99, 218, 246), player, border_radius=4)
    for bullet in bullets:
        pygame.draw.rect(screen, (255, 227, 143), bullet)
    for target in targets:
        pygame.draw.circle(screen, (255, 159, 92), target.center, 19)
        pygame.draw.circle(screen, (14, 27, 39), target.center, 9, 3)
    screen.blit(font.render("Targets: " + str(score) + " / 12", True, (235, 245, 250)), (20, 20))
    screen.blit(font.render("Move: arrows   Fire: Space", True, (150, 180, 195)), (20, 55))
    if won:
        screen.blit(font.render("Bullseye! Press R to play again.", True, (99, 218, 246)), (140, 270))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
