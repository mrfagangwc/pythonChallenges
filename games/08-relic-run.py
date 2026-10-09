# RELIC RUN — arrows or WASD to explore. Collect six relics, then enter
# the green portal. Avoid moving sentries. Three health points. R restarts.
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 560))
pygame.display.set_caption("Code Arcade - Relic Run")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 30)
player = pygame.Rect(40, 90, 28, 28)
walls = [pygame.Rect(180, 120, 24, 190), pygame.Rect(370, 230, 170, 24),
         pygame.Rect(590, 100, 24, 190), pygame.Rect(270, 390, 24, 140)]
relics = [pygame.Rect(110, 450, 18, 18), pygame.Rect(270, 160, 18, 18),
          pygame.Rect(460, 110, 18, 18), pygame.Rect(680, 180, 18, 18),
          pygame.Rect(440, 440, 18, 18), pygame.Rect(700, 440, 18, 18)]
# Each sentry has a matching horizontal speed in the supplied speed list.
enemies = [pygame.Rect(230, 190, 30, 30), pygame.Rect(400, 330, 30, 30),
           pygame.Rect(620, 475, 30, 30)]
enemy_speeds = [3, -2, 3]
portal = pygame.Rect(730, 80, 45, 45)
health = 3
collected = 0
invincible = 0
won = False
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
                player.topleft = (40, 90)
                health = 3
                collected = 0
                invincible = 0
                won = False
                game_over = False
                relics = [pygame.Rect(110, 450, 18, 18), pygame.Rect(270, 160, 18, 18),
                          pygame.Rect(460, 110, 18, 18), pygame.Rect(680, 180, 18, 18),
                          pygame.Rect(440, 440, 18, 18), pygame.Rect(700, 440, 18, 18)]
                enemies = [pygame.Rect(230, 190, 30, 30), pygame.Rect(400, 330, 30, 30),
                           pygame.Rect(620, 475, 30, 30)]
                enemy_speeds = [3, -2, 3]

    keys = pygame.key.get_pressed()
    if not won and not game_over:
        move_x = 0
        move_y = 0
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            move_x = -4
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            move_x = 4
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            move_y = -4
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            move_y = 4
        # Resolve each axis separately, so you can slide along a wall.
        player.x = player.x + move_x
        for wall in walls:
            if player.colliderect(wall):
                if move_x > 0:
                    player.right = wall.left
                if move_x < 0:
                    player.left = wall.right
        player.y = player.y + move_y
        for wall in walls:
            if player.colliderect(wall):
                if move_y > 0:
                    player.bottom = wall.top
                if move_y < 0:
                    player.top = wall.bottom
        player.clamp_ip(pygame.Rect(12, 70, 776, 478))
        if invincible > 0:
            invincible = invincible - 1
        for index in range(len(enemies)):
            enemy = enemies[index]
            enemy.x = enemy.x + enemy_speeds[index]
            if enemy.left <= 215 or enemy.right >= 780:
                enemy_speeds[index] = -enemy_speeds[index]
            if player.colliderect(enemy) and invincible == 0:
                health = health - 1
                # A short safe interval prevents losing every life in one hit.
                invincible = 90
                if health <= 0:
                    game_over = True
        for relic in relics[:]:
            if player.colliderect(relic):
                relics.remove(relic)
                collected = collected + 1
        if collected == 6 and not game_over:
            if player.colliderect(portal):
                won = True

    screen.fill((18, 30, 29))
    for x in range(0, 800, 40):
        pygame.draw.line(screen, (28, 43, 40), (x, 70), (x, 560))
    for y in range(70, 560, 40):
        pygame.draw.line(screen, (28, 43, 40), (0, y), (800, y))
    for wall in walls:
        pygame.draw.rect(screen, (65, 91, 83), wall, border_radius=3)
    for relic in relics:
        pygame.draw.polygon(screen, (255, 205, 108), [relic.midtop, relic.midright, relic.midbottom, relic.midleft])
    for enemy in enemies:
        pygame.draw.rect(screen, (237, 126, 122), enemy, border_radius=6)
        pygame.draw.circle(screen, (30, 28, 32), enemy.center, 5)
    portal_colour = (100, 135, 118)
    if collected == 6:
        portal_colour = (181, 251, 104)
    pygame.draw.rect(screen, portal_colour, portal, 4, border_radius=10)
    # Flash the player during the supplied invincibility interval.
    if invincible == 0 or invincible % 12 < 6:
        pygame.draw.rect(screen, (143, 221, 237), player, border_radius=5)
    screen.blit(font.render("Relics: " + str(collected) + " / 6     Health: " + str(health), True, (235, 245, 235)), (20, 20))
    if won:
        screen.blit(font.render("All relics recovered! R to explore again.", True, (181, 251, 104)), (180, 280))
    elif game_over:
        screen.blit(font.render("Adventure over. Press R to retry.", True, (255, 177, 164)), (220, 280))
    else:
        screen.blit(font.render("Collect six relics. Reach the top-right portal.", True, (164, 190, 178)), (330, 20))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
