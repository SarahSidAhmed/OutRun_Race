CAR_Y_POS = SCREEN_HEIGHT - (CAR_IMG_STRAIGHT.height >> 1) - 6
BACKDROP_IMG = img("""
    ................................................................................................................................................................
    .........................................................................6666b..................................................................................
    ...............................................................6766....6677666b6................................................................................
    .............................................................6676666..6777666b6b6...............................................................................
    ...............776786.......................................b67676666677666966b6b...............................................................................
    ............77777787886b...................................66767666667766696966b6b..............................................................................
    ...........777776766b6b6b..................66b6b.........666b66666667769696969666666............................................................................
    ..........77676766766b6b6b................6666b6b6.....666666666666666966696966666666...........................................................................
    .........7667676769696b6b6b6.............6666b6b6b6b..66b666666666666966b66669666666666.........................................................................
    .......767766b69696969666b6b6...........666666b6b6b6..6666666666669696966b6666969666666666..........................................................666b6b6.....
    .....6667696b6b69696966666b6b6b......6666776666b6b6b66666666666969696966b6b66666696666e6e6b66......................................................76766b6b6b...
    ...6666969666b6669696966666666666..666667767666666b6b66666666696969666666b6b66666696666e666b666666666..........................................7667676666b6b6b..
    66666696966666b66666969666666666666666667666666666666b666b466969696666666666b666666666666666b6b6b6666666666666............666666666.........677767666e6666b6b6b6
    666969666666666666666669666666666d666667666666666d6666b66466969666666666646666666666666666666b6b6b6b66666466666666.....6666666b4666666..66666666666646e666666b66
    6666666666d666666666666666666666666646666666666666666666666666666666666666666666666666664666666666b666666666666646666666666b46666666b466666666666666666666666666
    6d66666666666666646666666d666b6666b666b66b6b66b666b66666b66b6b6b66b6666b6666b66b6b6b6b6b6b66b666b6666b66b666b6b6b6b6b6b6b666666b6666666666b6b6b66b666b666b666b66
    """)
EXPLOSION_MELODY_1 = music.Melody("~11 !60,150 !100,50 !80,100 !60,150 !100,50 !80,100 !60,150 !100,250 !80,150 !60,350 !100,150 !80,150 @0,0,255,200 !60,150")
EXPLOSION_MELODY_2 = music.Melody("~13 !80,50 !60,150 !100,150 !80,150 !60,150 !100,150 !80,150 !60,150 !100,150 !80,150 !60,150 !100,150 @0,0,255,200 !80,100")
EXPLOSION_MELODY_3 = music.Melody("~5 !80,2000")
info.set_score(0)
info.show_score(False)
countdown = Countdown()
countdown.load(60)
running = False
isOver = False
endReached = False
crashed = False
showCar = False
timeExtended = False
worldRender = WorldRender()
carPhysics = CarPhysics()
explosionAnimation = ExplosionAnimation(40, 10, 2000, CAR_EXPLOSION_FRAMES)
melodyPlayer1 = music.MelodyPlayer(EXPLOSION_MELODY_1)
melodyPlayer2 = music.MelodyPlayer(EXPLOSION_MELODY_2)
melodyPlayer3 = music.MelodyPlayer(EXPLOSION_MELODY_3)
doubledFont = image.scaled_font(image.font8, 2)
speedTextLabel = TextRender("SPEED", 1, 3)
speedTextValue = TextRender(str(carPhysics.speed()), 1, 3, doubledFont)
countDownLabel = TextRender("TIME", 1, 3)
countDownValue = TextRender(str(countdown.remaining_time()), 1, 3, doubledFont)
scoreTextLabel = TextRender("SCORE", 1, 3)
scoreTextValue = TextRender(str(info.score()), 1, 3, doubledFont)

def on_on_paint():
    global crashed, endReached, timeExtended, CAR_VIEWPORT
    if isOver or endReached:
        return
    if running:
        if crashed:
            # Quickly stop the car after a crash
            if not explosionAnimation.is_done():
                carPhysics.hard_stop()
            else:
                # Move the car back on road center
                # when the explosion animation is done
                carPhysics.move_to_xpos(0, 40)
                pippo = carPhysics.car_xpos()
                if carPhysics.car_xpos() == 0:
                    crashed = False
        else:
            offRoad = abs(Math.imul(carPhysics.car_xpos(), POS_FIXED_MATH_ONE)) > STRIPE_HALF_WIDTH_FP
            carPhysics.update_speed(controller.A.is_pressed(),
                controller.B.is_pressed(),
                controller.left.is_pressed(),
                controller.right.is_pressed(),
                offRoad)
            deltaDistance = carPhysics.delta_traveled_distance()
            oldDistance = carPhysics.traveled_distance() - deltaDistance
            roadCurveDelta = worldRender.calc_road_curve_in_segment(oldDistance, deltaDistance)
            carPhysics.apply_road_delta_curve(roadCurveDelta)
    else:
        carPhysics.clear()
    # Get player car horizontal position and set camera center
    carXPos = carPhysics.car_xpos()
    if carXPos >= 0:
        if carXPos > CAR_VIEWPORT:
            perspectiveHorizontalCenter = SCREEN_HALF_WIDTH_PLUS_CAR_VIEWPORT - carXPos
            carXPos2D = SCREEN_HALF_WIDTH_PLUS_CAR_VIEWPORT
        else:
            perspectiveHorizontalCenter = SCREEN_HALF_WIDTH
            carXPos2D = SCREEN_HALF_WIDTH + carXPos
    else:
        if carXPos < (-CAR_VIEWPORT):
            perspectiveHorizontalCenter = SCREEN_HALF_WIDTH_MINUS_CAR_VIEWPORT - carXPos
            carXPos2D = SCREEN_HALF_WIDTH_MINUS_CAR_VIEWPORT
        else:
            perspectiveHorizontalCenter = SCREEN_HALF_WIDTH
            carXPos2D = SCREEN_HALF_WIDTH + carXPos
    # Draw the world
    backgroundImg = scene.background_image()
    traveledDistance = carPhysics.traveled_distance()
    endReached = worldRender.draw(backgroundImg, traveledDistance, perspectiveHorizontalCenter)
    if endReached:
        carPhysics.set_speed(0)
    # Draw the car
    if carPhysics.speed() > 1:
        # Car turn animation    
        if controller.left.is_pressed():
            carFrame = CAR_IMG_LEFT
        elif controller.right.is_pressed():
            carFrame = CAR_IMG_RIGHT
        else:
            carFrame = CAR_IMG_STRAIGHT
    else:
        carFrame = CAR_IMG_STRAIGHT
    carDrawX = carXPos2D - (carFrame.width >> 1)
    carDrawY = CAR_Y_POS - (carFrame.height >> 1)
    if showCar:
        backgroundImg.draw_transparent_image(carFrame, carDrawX, carDrawY)
    # Draw car explosion animation
    if not explosionAnimation.is_done():
        explosionAnimation.draw(backgroundImg, carXPos2D, CAR_Y_POS)
    # Draw HUD
    speedTextValue.set_text(str(carPhysics.speed()))
    countDownValue.set_text(str(countdown.remaining_time()))
    scoreTextValue.set_text(str(info.score()))
    speedTextLabel.draw(backgroundImg, 1, 1)
    speedTextValue.draw(backgroundImg, 0, speedTextLabel.height() + 2)
    countDownLabel.draw(backgroundImg, SCREEN_HALF_WIDTH, 1, TextAlignment.CENTER)
    countDownValue.draw(backgroundImg,
        SCREEN_HALF_WIDTH,
        countDownLabel.height() + 2,
        TextAlignment.CENTER)
    scoreTextLabel.draw(backgroundImg, SCREEN_WIDTH - 2, 1, TextAlignment.RIGHT)
    scoreTextValue.draw(backgroundImg,
        SCREEN_WIDTH - 1,
        scoreTextLabel.height() + 2,
        TextAlignment.RIGHT)
    if not crashed and showCar:
        # Check if car is outside the road
        if Math.imul(abs(carXPos) + (carFrame.width >> 1), POS_FIXED_MATH_ONE) > STRIPE_HALF_WIDTH_FP:
            # Check for crash against obstacles
            colX1 = carXPos - (carFrame.width >> 1)
            colX2 = colX1 + carFrame.width
            colY2 = Math.idiv(ROAD_INIT_Y, POS_FIXED_MATH_ONE) - (SCREEN_HEIGHT - CAR_Y_POS + (carFrame.height >> 1))
            colY1 = colY2 - carFrame.height
            if worldRender.check_collision(colX1, colY1, colX2, colY2, STRIPE_HEIGHT >> 1):
                crashed = True
                
                def on_run_in_parallel():
                    melodyPlayer1.play(170)
                control.run_in_parallel(on_run_in_parallel)
                
                
                def on_run_in_parallel2():
                    melodyPlayer2.play(170)
                control.run_in_parallel(on_run_in_parallel2)
                
                
                def on_run_in_parallel3():
                    melodyPlayer3.play(90)
                control.run_in_parallel(on_run_in_parallel3)
                
                explosionAnimation.begin()
    # Extend time on check sign
    if not timeExtended and worldRender.on_check_sign(traveledDistance):
        timeExtended = True
        countdown.add(30)
        
        def on_run_in_parallel4():
            music.play_melody("B5:2 R:1 B5:2 R:1 B5:2", 160)
        control.run_in_parallel(on_run_in_parallel4)
        
game.on_paint(on_on_paint)

def beginSequence():
    global showCar
    # Show car entering the scene
    carSprite = sprites.create(CAR_IMG_SIDE_L)
    carSprite.x = 200
    carSprite.y = CAR_Y_POS
    carSprite.vx = -100
    while carSprite.x > SCREEN_HALF_WIDTH:
        pause(10)
    carSprite.vx = 0
    carSprite.x = SCREEN_HALF_WIDTH
    carSprite.set_image(CAR_IMG_LEFT_2)
    carSprite.x = SCREEN_HALF_WIDTH
    pause(100)
    carSprite.set_image(CAR_IMG_LEFT)
    carSprite.x = SCREEN_HALF_WIDTH
    pause(100)
    carSprite.set_image(CAR_IMG_STRAIGHT)
    carSprite.x = SCREEN_HALF_WIDTH
    showCar = True
    pause(100)
    carSprite.destroy()
    # Start countdown
    music.set_volume(255)
    music.set_tempo(60)
    OBST_SEMAPHORE_SIGN.image = OBST_IMG_SEMAPHORE_RED_1
    music.play_melody("C5:1 R:4", 60)
    OBST_SEMAPHORE_SIGN.image = OBST_IMG_SEMAPHORE_RED_2
    music.play_melody("C5:1 R:4", 60)
    OBST_SEMAPHORE_SIGN.image = OBST_IMG_SEMAPHORE_GREEN
    
    def on_run_in_parallel5():
        music.play_melody("A5:4", 60)
    control.run_in_parallel(on_run_in_parallel5)
    
beginSequence()
countdown.start()
running = True

def on_update_interval():
    global isOver
    if not isOver:
        info.change_score_by(Math.idiv(carPhysics.speed(), 20))
        info.show_score(False)
        # Time over game end
        if countdown.is_expired():
            isOver = True
            game.over()
        # Circuit end reached. Game won
        if endReached:
            isOver = True
            game.over(True, effects.confetti)
game.on_update_interval(200, on_update_interval)
