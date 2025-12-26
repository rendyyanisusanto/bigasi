import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'

// Auth pages
import Login from '../pages/auth/Login.vue'
import Register from '../pages/auth/Register.vue'
import ResetPassword from '../pages/auth/ResetPassword.vue'

// Admin pages
import AdminDashboard from '../pages/admin/Dashboard.vue'
import Athletes from '../pages/admin/Athletes.vue'
import Coaches from '../pages/admin/Coaches.vue'
import Sports from '../pages/admin/Sports.vue'
import Payments from '../pages/admin/Payments.vue'
import Events from '../pages/admin/Events.vue'
import UserRegistrations from '../pages/admin/UserRegistrations.vue'
import Settings from '../pages/admin/Settings.vue'
import AdminProfile from '../pages/admin/Profile.vue'

// Coach pages
import CoachDashboard from '../pages/coach/Dashboard.vue'
import MyAthletes from '../pages/coach/MyAthletes.vue'
import TrainingNotes from '../pages/coach/TrainingNotes.vue'
import CoachReports from '../pages/coach/Reports.vue'
import CoachEvents from '../pages/coach/Events.vue'
import CoachProfile from '../pages/coach/Profile.vue'

// Parent pages
import ParentDashboard from '../pages/parent/Dashboard.vue'
import AthleteProfile from '../pages/parent/AthleteProfile.vue'
import ParentTrainingNotes from '../pages/parent/TrainingNotes.vue'
import ParentReports from '../pages/parent/Reports.vue'
import PaymentHistory from '../pages/parent/PaymentHistory.vue'
import ParentEvents from '../pages/parent/Events.vue'

const routes = [
    {
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { requiresGuest: true }
    },
    {
        path: '/reset-password',
        name: 'ResetPassword',
        component: ResetPassword,
        meta: { requiresGuest: true }
    },
    // Admin routes
    {
        path: '/admin/dashboard',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/athletes',
        name: 'Athletes',
        component: Athletes,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/coaches',
        name: 'Coaches',
        component: Coaches,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/sports',
        name: 'Sports',
        component: Sports,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/payments',
        name: 'Payments',
        component: Payments,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/events',
        name: 'Events',
        component: Events,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/registrations',
        name: 'UserRegistrations',
        component: UserRegistrations,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/settings',
        name: 'Settings',
        component: Settings,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    {
        path: '/admin/profile',
        name: 'AdminProfile',
        component: AdminProfile,
        meta: { requiresAuth: true, role: 'ADMIN' }
    },
    // Coach routes
    {
        path: '/coach/dashboard',
        name: 'CoachDashboard',
        component: CoachDashboard,
        meta: { requiresAuth: true, role: 'COACH' }
    },
    {
        path: '/coach/athletes',
        name: 'MyAthletes',
        component: MyAthletes,
        meta: { requiresAuth: true, role: 'COACH' }
    },
    {
        path: '/coach/training-notes',
        name: 'TrainingNotes',
        component: TrainingNotes,
        meta: { requiresAuth: true, role: 'COACH' }
    },
    {
        path: '/coach/reports',
        name: 'CoachReports',
        component: CoachReports,
        meta: { requiresAuth: true, role: 'COACH' }
    },
    {
        path: '/coach/events',
        name: 'CoachEvents',
        component: CoachEvents,
        meta: { requiresAuth: true, role: 'COACH' }
    },
    {
        path: '/coach/profile',
        name: 'CoachProfile',
        component: CoachProfile,
        meta: { requiresAuth: true, role: 'COACH' }
    },
    // Parent routes
    {
        path: '/parent/dashboard',
        name: 'ParentDashboard',
        component: ParentDashboard,
        meta: { requiresAuth: true, role: 'PARENT' }
    },
    {
        path: '/parent/athlete',
        name: 'AthleteProfile',
        component: AthleteProfile,
        meta: { requiresAuth: true, role: 'PARENT' }
    },
    {
        path: '/parent/training-notes',
        name: 'ParentTrainingNotes',
        component: ParentTrainingNotes,
        meta: { requiresAuth: true, role: 'PARENT' }
    },
    {
        path: '/parent/reports',
        name: 'ParentReports',
        component: ParentReports,
        meta: { requiresAuth: true, role: 'PARENT' }
    },
    {
        path: '/parent/payments',
        name: 'PaymentHistory',
        component: PaymentHistory,
        meta: { requiresAuth: true, role: 'PARENT' }
    },
    {
        path: '/parent/events',
        name: 'ParentEvents',
        component: ParentEvents,
        meta: { requiresAuth: true, role: 'PARENT' }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
    const { isAuthenticated, userRole, initAuth, profile } = useAuth()

    // Always initialize auth on first navigation
    await initAuth()

    // Check if route requires authentication
    if (to.meta.requiresAuth && !isAuthenticated.value) {
        next('/login')
        return
    }

    // Check if route requires guest (not authenticated)
    if (to.meta.requiresGuest && isAuthenticated.value) {
        // Wait a bit for profile to load
        if (!profile.value) {
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Redirect to role-based dashboard
        if (userRole.value === 'ADMIN') {
            next('/admin/dashboard')
        } else if (userRole.value === 'COACH') {
            next('/coach/dashboard')
        } else if (userRole.value === 'PARENT') {
            next('/parent/dashboard')
        } else {
            // If no role yet, stay on current page
            next()
        }
        return
    }

    // Check role-based access
    if (to.meta.role && to.meta.role !== userRole.value) {
        // Wait a bit for profile to load if not loaded yet
        if (!profile.value && isAuthenticated.value) {
            await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Redirect to appropriate dashboard
        if (userRole.value === 'ADMIN') {
            next('/admin/dashboard')
        } else if (userRole.value === 'COACH') {
            next('/coach/dashboard')
        } else if (userRole.value === 'PARENT') {
            next('/parent/dashboard')
        } else {
            next('/login')
        }
        return
    }

    next()
})

export default router
