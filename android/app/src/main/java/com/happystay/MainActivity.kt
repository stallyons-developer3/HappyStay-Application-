package com.happystay

import android.os.Build
import android.os.Bundle
import android.graphics.Color
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.widget.FrameLayout
import androidx.core.view.ViewCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  override fun getMainComponentName(): String = "happystay"

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)

    val window: Window = getWindow()
    val primaryColor = Color.parseColor("#26B16D")

    // Try traditional approach first (works on Android <= 15)
    window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS)
    window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS)
    window.statusBarColor = primaryColor

    // Light status bar icons (white on green)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.isAppearanceLightStatusBars = false

    if (Build.VERSION.SDK_INT >= 35) {
      window.isStatusBarContrastEnforced = false
    }

    // Android 16+ (API 36): statusBarColor is ignored, draw behind status bar
    if (Build.VERSION.SDK_INT >= 36) {
      WindowCompat.setDecorFitsSystemWindows(window, false)

      // Add a colored view behind the status bar
      val statusBarView = View(this)
      statusBarView.setBackgroundColor(primaryColor)

      ViewCompat.setOnApplyWindowInsetsListener(window.decorView) { view, insets ->
        val statusBarHeight = insets.getInsets(WindowInsetsCompat.Type.statusBars()).top
        val params = statusBarView.layoutParams
        if (params != null) {
          params.height = statusBarHeight
          statusBarView.layoutParams = params
        } else {
          statusBarView.layoutParams = FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            statusBarHeight
          )
        }

        // Offset the content below the status bar
        val content = findViewById<View>(android.R.id.content)
        content.setPadding(0, statusBarHeight, 0, 0)

        insets
      }

      val decorView = window.decorView as FrameLayout
      decorView.addView(statusBarView, FrameLayout.LayoutParams(
        FrameLayout.LayoutParams.MATCH_PARENT,
        0
      ))
    } else {
      WindowCompat.setDecorFitsSystemWindows(window, true)
    }
  }

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
