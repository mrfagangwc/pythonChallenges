# SKYLINE SPRINT — arrows/A/D to run, Space/Up/W to jump.
# Collect four gems and reach the green exit. Avoid spikes. R restarts.
import pygame

pygame.init()
screen = pygame.display.set_mode((800, 540))
pygame.display.set_caption("Code Arcade - Skyline Sprint")
clock = pygame.time.Clock()
font = pygame.font.Font(None, 30)
player = pygame.Rect(35, 465, 26, 34)
# Platform heights increase gradually; each jump can reach the next one.
platforms = [pygame.Rect(0, 500, 800, 40),
             pygame.Rect(100, 415, 140, 16),
             pygame.Rect(285, 330, 140, 16),
             pygame.Rect(470, 245, 140, 16),
             pygame.Rect(655, 160, 140, 16)]
gems = [pygame.Rect(154, 385, 16, 20), pygame.Rect(339, 300, 16, 20),
        pygame.Rect(524, 215, 16, 20), pygame.Rect(709, 130, 16, 20)]
hazards = [pygame.Rect(255, 484, 45, 16), pygame.Rect(440, 484, 45, 16),
           pygame.Rect(620, 484, 45, 16)]
exit_door = pygame.Rect(752, 112, 32, 48)
# Decimal gravity needs a separate real-valued vertical position.
player_y = float(player.y)
vertical_speed = 0.0
gravity = 0.55
on_ground = False
score = 0
lives = 3
won = False
game_over = False
running = True

while running:
    jump_pressed = False
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False
            if event.key in (pygame.K_SPACE, pygame.K_UP, pygame.K_w):
                jump_pressed = True
            if event.key == pygame.K_r:
                player.topleft = (35, 465)
                player_y = float(player.y)
                vertical_speed = 0.0
                on_ground = False
                score = 0
                lives = 3
                won = False
                game_over = False
                gems = [pygame.Rect(154, 385, 16, 20), pygame.Rect(339, 300, 16, 20),
                        pygame.Rect(524, 215, 16, 20), pygame.Rect(709, 130, 16, 20)]

    keys = pygame.key.get_pressed()
    if not won and not game_over:
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            player.x = player.x - 5
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            player.x = player.x + 5
        player.x = max(0, min(800 - player.width, player.x))
        if jump_pressed and on_ground:
            vertical_speed = -11
        previous_bottom = player.bottom
        vertical_speed = vertical_speed + gravity
        player_y = player_y + vertical_speed
        player.y = int(player_y)
        on_ground = False
        # These are one-way platforms: jump up through, land from above.
        for platform in platforms:
            if vertical_speed >= 0:
                if player.right > platform.left and player.left < platform.right:
                    if previous_bottom <= platform.top and player.bottom >= platform.top:
                        player.bottom = platform.top
                        player_y = float(player.y)
                        vertical_speed = 0.0
                        on_ground = True
        for gem in gems[:]:
            if player.colliderect(gem):
                gems.remove(gem)
                score = score + 1
        for hazard in hazards:
            if player.colliderect(hazard):
                lives = lives - 1
                player.topleft = (35, 465)
                player_y = float(player.y)
                vertical_speed = 0.0
                on_ground = False
                if lives <= 0:
                    game_over = True
                break
        if score == 4:
            if player.colliderect(exit_door):
                won = True

    screen.fill((18, 31, 43))
    # Original skyline built from rectangles, not external art.
    for building in range(12):
        pygame.draw.rect(screen, (27, 46, 59), (building * 75, 260 + (building % 3) * 40, 55, 280))
    for platform in platforms:
        pygame.draw.rect(screen, (74, 118, 133), platform, border_radius=3)
        pygame.draw.line(screen, (121, 210, 221), platform.topleft, platform.topright, 3)
    for gem in gems:
        pygame.draw.polygon(screen, (255, 210, 102), [gem.midtop, gem.midright, gem.midbottom, gem.midleft])
    for hazard in hazards:
        pygame.draw.polygon(screen, (255, 118, 120), [hazard.bottomleft, hazard.midtop, hazard.bottomright])
    pygame.draw.rect(screen, (137, 245, 177), exit_door, 3)
    pygame.draw.rect(screen, (211, 177, 255), player, border_radius=4)
    screen.blit(font.render("Gems: " + str(score) + " / 4     Lives: " + str(lives), True, (230, 245, 250)), (20, 16))
    screen.blit(font.render("Collect all gems, then reach the green exit", True, (164, 190, 200)), (20, 48))
    if won:
        screen.blit(font.render("Skyline conquered! R to replay.", True, (137, 245, 177)), (225, 220))
    if game_over:
        screen.blit(font.render("Out of lives. R to try again.", True, (255, 170, 175)), (250, 220))
    pygame.display.flip()
    clock.tick(60)

pygame.quit()
