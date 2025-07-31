# Get thresholds for beginner mode (more relaxed)
def get_thresholds_beginner():
    ANGLE_HIP_KNEE_VERT = {
                            'NORMAL' : (0,  40),  # Increased upper bound
                            'TRANS'  : (30, 75),  # Wider transition range
                            'PASS'   : (65, 100)  # Lower minimum, higher maximum
                           }    
        
    thresholds = {
                    'HIP_KNEE_VERT': ANGLE_HIP_KNEE_VERT,
                    'HIP_THRESH'   : [5, 60],     # More forgiving hip thresholds
                    'ANKLE_THRESH' : 55,          # Increased ankle threshold
                    'KNEE_THRESH'  : [40, 65, 100], # Relaxed knee thresholds
                    'OFFSET_THRESH'    : 45.0,    # Increased offset threshold
                    'INACTIVE_THRESH'  : 20.0,    # Increased inactive threshold
                    'CNT_FRAME_THRESH' : 40       # Reduced frame threshold
                }
    return thresholds

# Get thresholds for pro mode (slightly relaxed)
def get_thresholds_pro():
    ANGLE_HIP_KNEE_VERT = {
                            'NORMAL' : (0,  35),  # Slightly increased
                            'TRANS'  : (32, 70),  # Wider transition range
                            'PASS'   : (75, 100)  # Slightly relaxed max
                           }    
        
    thresholds = {
                    'HIP_KNEE_VERT': ANGLE_HIP_KNEE_VERT,
                    'HIP_THRESH'   : [12, 55],    # Slightly relaxed
                    'ANKLE_THRESH' : 35,          # Slightly increased
                    'KNEE_THRESH'  : [45, 75, 100], # Relaxed thresholds
                    'OFFSET_THRESH'    : 40.0,    # Increased offset threshold
                    'INACTIVE_THRESH'  : 18.0,    # Increased inactive threshold
                    'CNT_FRAME_THRESH' : 45       # Slightly reduced
                 }
                 
    return thresholds