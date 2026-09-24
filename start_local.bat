@echo off
TITLE Video Making Studio - Local Runner
echo ===================================================
echo     🎬 Video Making Studio - Local Launcher
echo ===================================================
echo.

IF NOT EXIST "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
    IF ERRORLEVEL 1 (
        echo [ERROR] Failed to create virtual environment. Please ensure Python 3.10-3.12 is installed.
        pause
        exit /b 1
    )
)

echo [INFO] Activating virtual environment...
call venv\Scripts\activate

echo [INFO] Checking dependencies...
pip install -r requirements.txt

echo.
echo ===================================================
echo   Choose an option:
echo   [1] Open GitHub Pages Web Studio (Browser)
echo   [2] Launch Local CogVideoX Gradio Web App
echo   [3] Run Text-to-Video CLI Demo
echo   [4] Exit
echo ===================================================
set /p opt="Enter choice (1-4): "

if "%opt%"=="1" (
    echo Opening Web Studio in default browser...
    start index.html
    goto end
)
if "%opt%"=="2" (
    echo Launching Gradio Web Demo...
    python inference/gradio_web_demo.py
    goto end
)
if "%opt%"=="3" (
    set /p prompt="Enter video prompt: "
    python inference/cli_demo.py --prompt "%prompt%" --model_path THUDM/CogVideoX-2b --generate_type "t2v"
    goto end
)

:end
pause
