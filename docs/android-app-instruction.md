# Claude Code Instruction: Android Task Board Application

## Prompt for Claude Code

Copy and paste the following instruction into Claude Code to create an Android version of the QA Automation Testing application:

---

## Instruction

I want to create an Android application to test QA automation engineers in live coding (Appium/Espresso testing). Create a **"Task Board"** Android app that simulates a simple Kanban-style task management interface. The application should be intentionally designed to surface common mobile automation challenges that candidates must identify and handle.

### Technology Stack

- **Language:** Kotlin
- **UI Framework:** Jetpack Compose (Material 3)
- **Architecture:** MVVM with Clean Architecture
- **Dependency Injection:** Hilt
- **Async:** Kotlin Coroutines + Flow
- **Navigation:** Jetpack Navigation Compose
- **Minimum SDK:** 24 (Android 7.0)
- **Target SDK:** 34 (Android 14)

---

## Application Features

### Screen Structure

The application consists of a single screen with the following components:

**Top App Bar** - A collapsing toolbar with app title and search icon

**Task Creation FAB** - Floating Action Button that opens a bottom sheet form

**Task Board** - Three horizontal sections/tabs displaying tasks: "To Do", "In Progress", "Done"

**Snackbar Notifications** - Appear when actions complete

**Cookie/Privacy Consent Dialog** - Appears on first launch, blocks interaction until dismissed

---

## Detailed Component Specifications

### 1. Top App Bar

```kotlin
TopAppBar(
    title = { Text("Task Board") },
    actions = {
        IconButton(onClick = { showSearchDialog = true }) {
            Icon(Icons.Default.Search, contentDescription = "Search")
        }
        IconButton(onClick = { showUserMenu = true }) {
            Icon(Icons.Default.Person, contentDescription = "Profile")
        }
    }
)
```

**Automation Challenge:** The collapsing toolbar behavior and action icons require specific content descriptions for accessibility-based locators.

---

### 2. Privacy Consent Dialog

```kotlin
@Composable
fun PrivacyConsentDialog(
    onAccept: () -> Unit,
    onDecline: () -> Unit
) {
    // Shows after 500ms delay on first app launch
    // Modal dialog that blocks all interaction
    // Must be dismissed before using the app
}
```

**Behavior:**
- Appears after 500ms delay on first launch
- Uses `AlertDialog` or `ModalBottomSheet`
- Persists consent in DataStore/SharedPreferences
- Blocks all UI interaction until dismissed

**Automation Challenge:** Dialog appears asynchronously, blocks all other interactions. Tests must handle this before any other actions.

---

### 3. Task Creation Bottom Sheet

```kotlin
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskCreationSheet(
    sheetState: SheetState,
    onCreateTask: (title: String, description: String, priority: Priority) -> Unit
) {
    ModalBottomSheet(sheetState = sheetState) {
        Column(modifier = Modifier.padding(16.dp)) {
            OutlinedTextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Task Title *") },
                isError = titleError,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("task_title_input")
            )

            if (titleError) {
                Text(
                    text = "Title is required",
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.testTag("title_error_message")
                )
            }

            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text("Description (optional)") },
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("task_description_input")
            )

            // Priority dropdown
            ExposedDropdownMenuBox(...) {
                // Low, Medium, High options
            }

            Button(
                onClick = { onCreateTask(title, description, priority) },
                enabled = !isSubmitting,
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("submit_task_button")
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(if (isSubmitting) "Saving..." else "Add Task")
            }
        }
    }
}
```

**Automation Challenges:**
- Bottom sheet animation requires waiting for sheet to be fully expanded
- Button shows loading state and becomes disabled during submission
- Validation adds/removes error text dynamically
- Form resets after successful submission

---

### 4. Task Board with Tabs/Pager

```kotlin
@Composable
fun TaskBoard(
    viewModel: TaskBoardViewModel = hiltViewModel()
) {
    val pagerState = rememberPagerState(pageCount = { 3 })

    Column {
        TabRow(selectedTabIndex = pagerState.currentPage) {
            Tab(
                selected = pagerState.currentPage == 0,
                onClick = { /* navigate to page */ },
                text = {
                    Row {
                        Text("To Do")
                        Badge { Text("${todoCount}") }
                    }
                },
                modifier = Modifier.testTag("tab_todo")
            )
            Tab(
                selected = pagerState.currentPage == 1,
                onClick = { /* navigate to page */ },
                text = { Text("In Progress (${inProgressCount})") },
                modifier = Modifier.testTag("tab_in_progress")
            )
            Tab(
                selected = pagerState.currentPage == 2,
                onClick = { /* navigate to page */ },
                text = { Text("Done (${doneCount})") },
                modifier = Modifier.testTag("tab_done")
            )
        }

        HorizontalPager(state = pagerState) { page ->
            TaskList(
                tasks = when (page) {
                    0 -> todoTasks
                    1 -> inProgressTasks
                    else -> doneTasks
                },
                onTaskClick = { /* show task menu */ }
            )
        }
    }
}
```

**Automation Challenge:** Horizontal pager requires swipe gestures or tab clicks to navigate between columns.

---

### 5. Individual Task Card

```kotlin
@Composable
fun TaskCard(
    task: Task,
    onMenuClick: () -> Unit,
    onMoveForward: () -> Unit,
    onDelete: () -> Unit,
    isHighlighted: Boolean = false
) {
    var showMenu by remember { mutableStateOf(false) }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .testTag("task_card_${task.id}")
            .then(
                if (isHighlighted) Modifier.border(2.dp, Color.Blue, RoundedCornerShape(8.dp))
                else Modifier
            ),
        colors = CardDefaults.cardColors(
            containerColor = when (task.priority) {
                Priority.HIGH -> Color(0xFFFEE2E2)
                Priority.MEDIUM -> Color(0xFFFEF3C7)
                Priority.LOW -> Color(0xFFD1FAE5)
            }
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = task.title,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.testTag("task_title_${task.id}")
                )
                IconButton(
                    onClick = { showMenu = true },
                    modifier = Modifier.testTag("task_menu_button_${task.id}")
                ) {
                    Icon(Icons.Default.MoreVert, contentDescription = "Task menu")
                }
            }

            if (task.description.isNotEmpty()) {
                Text(
                    text = task.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
            }

            // Dropdown Menu - only visible when showMenu is true
            DropdownMenu(
                expanded = showMenu,
                onDismissRequest = { showMenu = false },
                modifier = Modifier.testTag("task_menu_${task.id}")
            ) {
                if (task.status != TaskStatus.DONE) {
                    DropdownMenuItem(
                        text = { Text("Move Forward →") },
                        onClick = {
                            showMenu = false
                            onMoveForward()
                        },
                        modifier = Modifier.testTag("move_forward_button")
                    )
                }
                DropdownMenuItem(
                    text = { Text("Delete", color = Color.Red) },
                    onClick = {
                        showMenu = false
                        onDelete()
                    },
                    modifier = Modifier.testTag("delete_button")
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                AssistChip(
                    onClick = { },
                    label = { Text(task.priority.name) },
                    modifier = Modifier.testTag("priority_badge_${task.id}")
                )
                Text(
                    text = task.createdAt.formatRelative(),
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }
    }
}
```

**Automation Challenges:**
- Dropdown menu only appears after clicking the menu button
- Menu is a popup/overlay that may require special handling
- Moving a task causes it to disappear from current list and appear in another
- Task ID changes after move (causes stale element references)

---

### 6. Loading Overlay

```kotlin
@Composable
fun LoadingOverlay(isLoading: Boolean) {
    if (isLoading) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.5f))
                .clickable(enabled = false) { }
                .testTag("loading_overlay"),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(
                modifier = Modifier.testTag("loading_spinner"),
                color = Color.White
            )
        }
    }
}
```

**Behavior:**
- Full screen semi-transparent overlay
- Blocks all touch interactions
- Random duration: 800-1500ms for page load, 500-1000ms for task operations

**Automation Challenge:** Overlay blocks all interactions. Random duration makes hard-coded waits unreliable.

---

### 7. Snackbar Notifications

```kotlin
@Composable
fun TaskBoardScreen() {
    val snackbarHostState = remember { SnackbarHostState() }

    Scaffold(
        snackbarHost = {
            SnackbarHost(
                hostState = snackbarHostState,
                modifier = Modifier.testTag("snackbar_host")
            ) { data ->
                Snackbar(
                    snackbarData = data,
                    modifier = Modifier.testTag("snackbar_message")
                )
            }
        }
    ) {
        // Content
    }

    // Show snackbar after operations
    LaunchedEffect(taskCreated) {
        snackbarHostState.showSnackbar(
            message = "Task created successfully",
            duration = SnackbarDuration.Short // ~4 seconds
        )
    }
}
```

**Automation Challenge:** Snackbar auto-dismisses after ~4 seconds. Must verify message before it disappears.

---

### 8. Search Dialog

```kotlin
@Composable
fun SearchDialog(
    onDismiss: () -> Unit,
    onTaskSelected: (Task) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var searchResults by remember { mutableStateOf<List<Task>>(emptyList()) }
    var isSearching by remember { mutableStateOf(false) }

    // Debounced search - 300ms delay
    LaunchedEffect(searchQuery) {
        delay(300) // Debounce
        if (searchQuery.isNotEmpty()) {
            isSearching = true
            delay(Random.nextLong(200, 400)) // Simulate API delay
            searchResults = viewModel.searchTasks(searchQuery)
            isSearching = false
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        modifier = Modifier.testTag("search_dialog"),
        title = { Text("Search Tasks") },
        text = {
            Column {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search...") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("search_input")
                )

                if (isSearching) {
                    CircularProgressIndicator(modifier = Modifier.padding(16.dp))
                }

                LazyColumn {
                    items(searchResults) { task ->
                        ListItem(
                            headlineContent = { Text(task.title) },
                            supportingContent = { Text(task.status.displayName) },
                            modifier = Modifier
                                .clickable { onTaskSelected(task) }
                                .testTag("search_result_${task.id}")
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Close")
            }
        }
    )
}
```

**Automation Challenge:** 300ms debounce + 200-400ms simulated API delay before results appear.

---

## Simulated Delays

| Action | Delay Range | Notes |
|--------|-------------|-------|
| Initial app load | 1000-2000ms | Load tasks, shows loading overlay |
| Create task | 800-1200ms | Shows loading overlay |
| Move task | 400-700ms | Shows loading overlay |
| Delete task | 300-500ms | Shows loading overlay |
| Search | 300ms debounce + 200-400ms | Results appear after both delays |

---

## Test Scenarios for Candidates

### Scenario 1: Create a New Task

```gherkin
Given the Task Board app is launched
And the privacy consent dialog is dismissed
When I tap the FAB button
And I enter "Implement login feature" in the title field
And I select "High" priority
And I tap the Add Task button
Then a snackbar should appear with message "Task created successfully"
And the task should appear in the To Do tab
```

### Scenario 2: Move Task Through Columns

```gherkin
Given a task "Test Task" exists in the To Do tab
When I tap the menu button on that task
And I tap "Move Forward"
Then the task should appear in the In Progress tab
When I navigate to In Progress tab
Then I should see the task "Test Task"
```

### Scenario 3: Search and Navigate to Task

```gherkin
Given multiple tasks exist in the app
When I tap the search icon
And I type "login" in the search field
Then search results should appear showing matching tasks
When I tap on a search result
Then the app should navigate to that task's tab
And the task should be highlighted
```

### Scenario 4: Delete a Task

```gherkin
Given a task exists in the In Progress tab
When I tap the task menu
And I tap Delete
Then the task should be removed
And a snackbar should confirm deletion
```

### Scenario 5: Form Validation

```gherkin
When I tap the FAB to create a task
And I tap Add Task without entering a title
Then the title input should show an error state
And the error message "Title is required" should be visible
```

---

## Project Structure

```
app/
├── src/main/java/com/example/taskboard/
│   ├── MainActivity.kt
│   ├── TaskBoardApplication.kt
│   ├── di/
│   │   └── AppModule.kt
│   ├── data/
│   │   ├── model/
│   │   │   ├── Task.kt
│   │   │   ├── Priority.kt
│   │   │   └── TaskStatus.kt
│   │   ├── repository/
│   │   │   └── TaskRepository.kt
│   │   └── local/
│   │       └── PreferencesManager.kt
│   ├── domain/
│   │   └── usecase/
│   │       ├── CreateTaskUseCase.kt
│   │       ├── MoveTaskUseCase.kt
│   │       ├── DeleteTaskUseCase.kt
│   │       └── SearchTasksUseCase.kt
│   └── ui/
│       ├── theme/
│       │   └── Theme.kt
│       ├── components/
│       │   ├── TaskCard.kt
│       │   ├── TaskCreationSheet.kt
│       │   ├── LoadingOverlay.kt
│       │   ├── PrivacyConsentDialog.kt
│       │   └── SearchDialog.kt
│       ├── screen/
│       │   └── TaskBoardScreen.kt
│       └── viewmodel/
│           └── TaskBoardViewModel.kt
├── src/androidTest/java/com/example/taskboard/
│   └── (Espresso/Compose UI tests go here)
└── build.gradle.kts
```

---

## Key Automation Challenges Summary

| Component | Challenge | Why It's Tricky |
|-----------|-----------|-----------------|
| Privacy Dialog | 500ms delayed appearance, modal | Blocks all interaction, async appearance |
| Loading Overlay | Random duration (300-2000ms) | Hard-coded waits fail |
| Dropdown Menu | Only visible after clicking | Not in view hierarchy until opened |
| Task Move | Changes tab, regenerates ID | Stale element references |
| Snackbar | Auto-dismiss ~4 seconds | Must capture quickly |
| Search | 300ms debounce + API delay | Results don't appear immediately |
| Bottom Sheet | Slide animation | Must wait for animation to complete |
| HorizontalPager | Swipe navigation | Requires gesture or tab click |

---

## Test Tags Reference

All interactive elements should have `Modifier.testTag()` for Compose UI testing:

| Element | Test Tag |
|---------|----------|
| FAB Button | `fab_create_task` |
| Title Input | `task_title_input` |
| Description Input | `task_description_input` |
| Priority Dropdown | `priority_dropdown` |
| Submit Button | `submit_task_button` |
| Task Card | `task_card_{id}` |
| Task Menu Button | `task_menu_button_{id}` |
| Move Forward | `move_forward_button` |
| Delete Button | `delete_button` |
| Loading Overlay | `loading_overlay` |
| Search Input | `search_input` |
| Search Result | `search_result_{id}` |
| Tab To Do | `tab_todo` |
| Tab In Progress | `tab_in_progress` |
| Tab Done | `tab_done` |
| Snackbar | `snackbar_message` |
| Privacy Accept | `privacy_accept_button` |
| Privacy Decline | `privacy_decline_button` |

---

## Sample Tasks to Preload

Initialize the app with these tasks:

1. **"Setup project repository"** - Done, High priority
2. **"Design database schema"** - Done, High priority
3. **"Implement user authentication"** - In Progress, High priority
4. **"Create API endpoints"** - To Do, Medium priority
5. **"Write unit tests"** - To Do, Low priority

---

## Additional Requirements

1. **Add Hilt for dependency injection**
2. **Use StateFlow for reactive UI updates**
3. **Implement proper error handling with try-catch**
4. **Add content descriptions for accessibility (Appium)**
5. **Use Material 3 components throughout**
6. **Support both light and dark themes**
7. **Include proper loading states for all async operations**

---

## Build Configuration

```kotlin
// app/build.gradle.kts
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
    id("org.jetbrains.kotlin.plugin.compose")
    kotlin("kapt")
}

android {
    namespace = "com.example.taskboard"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.taskboard"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    // Compose BOM
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.ui:ui-tooling-preview")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Testing
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

---

Please create this Android application with all the specified automation challenges built in. The app should look professional and be fully functional while containing these intentional testing challenges.
