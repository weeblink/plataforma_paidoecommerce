<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BannersController;
use App\Http\Controllers\ConnectionsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmailMarketingController;
use App\Http\Controllers\ExtraManagementController;
use App\Http\Controllers\MentoringGroupManagementController;
use App\Http\Controllers\MentoringManagementController;
use App\Http\Controllers\WhatsappCampaignsController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ClassesController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseManagementController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\ModulesController;
use App\Http\Controllers\UserController;
use \App\Http\Controllers\CoursesAttachmentsController;
use \App\Http\Controllers\PaymentController;
use \App\Http\Controllers\EmailMarketingMetricsController;
use App\Http\Controllers\ParticipantsController;
use App\Http\Controllers\ExtraController;
use App\Http\Controllers\MentoringController;
use App\Http\Controllers\MeetScheduleController;
use App\Http\Controllers\MentoringScheduleManagementController;
use App\Http\Controllers\UserProductController;
use App\Http\Controllers\WhatsappGroupsController;

Route::middleware('api')->group(function () {

    Route::controller(AuthController::class)->group(function () {

        Route::post('/login', 'login');
        Route::post('/register', 'register');
        Route::post('/logout', 'logout');
        Route::post('/user/profile', 'profile');
        Route::post('/password/recover', 'requestPasswordRecovery');
        Route::put('/password/reset', 'resetPassword');
        Route::post('/password/reset/is-valid-token', 'verifyTokenResetPassword');
    });

    Route::middleware('auth:sanctum')->group(function () {

        Route::controller(AuthController::class)->group(function () {
            Route::post('/refresh_token', 'refreshToken');
        });

        Route::group(['middleware' => 'abilities:is-student'], function () {

            Route::prefix('courses')->group(function () {
                Route::get('/', [CourseController::class, 'listAll']);
                Route::get('/{id}', [CourseController::class, 'listOne']);
                Route::get('/{id}/payment', [CourseController::class, 'getCoursePaymentData']);
                Route::post('/{product_id}/{classId}/watched', [CourseController::class, 'markClassAsWatched']);
                Route::post('/{product_id}/{classId}/not-watched', [CourseController::class, 'markClassAsNotWatched']);
                Route::post('/{id}/buy', [CourseController::class, 'buyCourse']);
                Route::post('/{id}/check-free-course', [CourseController::class, 'checkFreeCourse']);
            });

            Route::prefix('mentorings')->group(function () {
                Route::get('/', [MentoringController::class, 'listAll']);
                Route::get('/{id}/groups', [MentoringController::class, 'getGroupsMentoring']);
                Route::get('/{id}/payment', [MentoringController::class, 'getMentorshipGroupPaymentData']);
                Route::get('/{group_id}', [MentoringController::class, 'mentoringDetails']);
            });

            Route::prefix('extras')->group(function () {
                Route::get('/', [ExtraController::class, 'listAll'])->name('extras');
                Route::get('/{id}', [ExtraController::class, 'listOne'])->name('extras.listOne');
                Route::get('/{id}/get-file', [ExtraController::class, 'getFile'])->name('extras.listOne.getFile');
                Route::get('/{id}/payment', [ExtraController::class, 'getExtraPaymentData']);
            });

            Route::prefix('profile')->group(function () {

                Route::controller(UserController::class)->group(function () {

                    Route::put('/{id}', [UserController::class, 'updateProfile']);

                    Route::get('/', [UserController::class, 'getProfileData']);
                });
            });

            Route::prefix('payments')->group(function () {

                Route::controller(PaymentController::class)->group(function () {

                    Route::post('/create', [PaymentController::class, 'createPayment']);
                    Route::get('/{payment_id}', [PaymentController::class, 'getPaymentData']);
                    
                });
            });

            Route::controller(UserProductController::class)->group(function () {
                Route::get('/user/{id}/products', 'getUserProducts');
            });

            Route::prefix('dashboard')->group(function () {
                Route::controller(DashboardController::class)->group(function () {
                    Route::get('/student', 'student');
                });
            });

            Route::prefix('meet/schedule')->group(function () {
                Route::controller(MeetScheduleController::class)->group(function () {
                    Route::get('/', 'listAll');
                    Route::post('/', 'create');
                    Route::patch('/mark-as-unavailable/{meet_schedule_id}', 'markAsUnavailable');
                    Route::patch('/mark-as-present/{meet_schedule_id}', 'markAsPresent');
                    Route::delete('/{meet_schedule_id}', 'delete');
                });
            });
        });

        Route::group(['middleware' => 'abilities:is-admin'], function () {

            Route::prefix('classes')->group(function () {

                Route::post('/{moduleId}', [ClassesController::class, 'create']);
                Route::put('/{id}', [ClassesController::class, 'update']);
                Route::post('/{id}/upload-video', [ClassesController::class, 'uploadVideo']);
                Route::delete('/{id}', [ClassesController::class, 'delete']);
                Route::patch('/swap-order', [ClassesController::class, 'swapOrder']);
            });

            Route::prefix('attachments')->group(function () {
                Route::get('/{class_id}', [CoursesAttachmentsController::class, 'listAll']);
                Route::post('/{class_id}', [CoursesAttachmentsController::class, 'saveAttachment']);
                Route::delete('/{attachment_id}', [CoursesAttachmentsController::class, 'deleteAttachment']);
            });

            Route::prefix('courses-management')->group(function () {

                Route::get('/', [CourseManagementController::class, 'listAll']);
                Route::get('/search', [CourseManagementController::class, 'search']);
                Route::get('/{id}', [CourseManagementController::class, 'listOne']);
                Route::post('/', [CourseManagementController::class, 'create']);
                Route::post('/update/{id}', [CourseManagementController::class, 'update']);
                Route::delete('/{id}', [CourseManagementController::class, 'delete']);
            });

            Route::prefix('modules')->group(function () {
                Route::post('/{classId}', [ModulesController::class, 'create']);
                Route::put('/{id}', [ModulesController::class, 'update']);
                Route::delete('/{id}', [ModulesController::class, 'delete']);
                Route::patch('/swap-order', [ModulesController::class, 'swapOrder']);
            });

            Route::controller(LeadController::class)->group(function () {
                Route::get('/leads', [LeadController::class, 'listAll']);
                Route::delete('/leads/{id}', [LeadController::class, 'delete']);
                Route::post('/leads/{id}/allow-access', [LeadController::class, 'allowAccess']);
                Route::delete('/leads/{id}/remove-access/{productId}', [LeadController::class, 'removeAccess']);
                Route::get('/leads/search/', [LeadController::class, 'search']);
                Route::post('/leads/add-new', [LeadController::class, 'addNew']);
            });

            Route::prefix('email-marketing')->group(function () {

                Route::controller(EmailMarketingController::class)->group(function () {

                    Route::post('/send', 'send')->name('email-marketing.send');
                    Route::get('/', 'getEmails')->name('email-marketing.get_email_data');
                    Route::delete('/remove/{email_id}', 'remove')->name('email-marketing.remove');
                    Route::get('/metrics/{email_id}', 'metrics')->name('email-marketing.metrics');
                });
            });

            Route::prefix('credentials-checkout')->group(function () {

                Route::controller(\App\Http\Controllers\CredentialsCheckoutController::class)->group(function () {

                    Route::post('/config', 'config')->name('credentials-checkout.config');
                    Route::get('/', 'listAll')->name('credentials-checkout.listAll');
                    Route::get("/available-checkouts", 'listAvailableCheckouts')->name('credentials-checkout.listAvailableCheckouts');
                    Route::get("/get-credential/{id}", 'getCredential')->name('credentials-checkout.getCredential');
                });
            });

            Route::prefix('banners')->group(function () {
                Route::controller(BannersController::class)->group(function () {
                    Route::get('/', [BannersController::class, 'listAll']);
                    Route::post('/', [BannersController::class, 'create']);
                    Route::post('/{id}', [BannersController::class, 'update']);
                    Route::delete('/{id}', [BannersController::class, 'delete']);
                    Route::patch('/swap-order', [BannersController::class, 'swapOrder']);
                });
            });

            Route::prefix('extras-management')->group(function () {
                Route::controller(ExtraManagementController::class)->group(function () {
                    Route::get('/', [ExtraManagementController::class, 'listAll']);
                    Route::get('/search', [ExtraManagementController::class, 'search']);
                    Route::post('/', [ExtraManagementController::class, 'create']);
                    Route::post('/{id}', [ExtraManagementController::class, 'update']);
                    Route::delete('/{id}', [ExtraManagementController::class, 'delete']);
                });
            });

            Route::prefix('mentoring-management')->group(function () {
                Route::controller(MentoringManagementController::class)->group(function () {
                    Route::get('/', [MentoringManagementController::class, 'listAll']);
                    Route::get('/search', [MentoringManagementController::class, 'search']);
                    Route::post('/', [MentoringManagementController::class, 'create']);
                    Route::post('/{id}', [MentoringManagementController::class, 'update']);
                    Route::delete('/{id}', [MentoringManagementController::class, 'delete']);
                });
            });

            Route::prefix('mentoring/group-management')->group(function () {
                Route::controller(MentoringGroupManagementController::class)->group(function () {
                    Route::get('/{mentoring_id}', [MentoringGroupManagementController::class, 'listAllByManagement']);
                    Route::post('/', [MentoringGroupManagementController::class, 'create']);
                    Route::post('/{group_id}', [MentoringGroupManagementController::class, 'update']);
                    Route::delete('/{group_id}', [MentoringGroupManagementController::class, 'delete']);
                });
            });

            Route::prefix('mentoring/schedule')->group(function () {
                Route::controller(MentoringScheduleManagementController::class)->group(function () {
                    Route::get('/', 'listAll');
                    Route::get('/calendar', 'getCalendarMeetings');
                    Route::post('/', 'create');
                    Route::post('/{calendar_time_id}', 'update');
                    Route::patch('/mark-as-unavailable/{calendar_time_id}', 'markAsUnavailable');
                    Route::delete('/{calendar_time_id}', 'delete');
                    Route::get('/groups', 'getAllGroups');
                    Route::post('/{id}', 'update');
                    Route::delete('/{id}', 'delete');
                    Route::post('/create/groups', 'createGroupSchedule');
                });
            });

            Route::prefix('connections')->group(function () {
                Route::controller(ConnectionsController::class)->group(function () {
                    Route::post('/', 'create')->name('connections');
                    Route::get('/', 'listAll')->name('connections.listAll');
                    Route::delete('/{id}', 'delete')->name('connections.delete');
                    Route::post('/{id}/qr-code', 'getQrCode')->name('connections.qr-code');
                });
            });

            Route::prefix('whatsapp-groups')->group(function () {
                Route::controller(WhatsappGroupsController::class)->group(function () {
                    Route::get("/", 'listAll')->name("whatsapp-groups");
                    Route::get("/count", 'qntGroups')->name("whatsapp-groups.count");
                });
            });

            Route::prefix('participants')->group(function () {
                Route::controller(ParticipantsController::class)->group(function () {
                    Route::get('/count', 'qntParticipants')->name('participants.count');
                });
            });

            Route::prefix('whatsapp-campaigns')->group(function () {
                Route::controller(WhatsappCampaignsController::class)->group(function () {
                    Route::get('/', 'listAll')->name('whatsapp-campaigns');
                    Route::post('/create', 'createNewCampaign')->name('whatsapp-campaigns.create');
                });
            });

            Route::prefix('dashboard')->group(function () {
                Route::controller(DashboardController::class)->group(function () {
                    Route::get('/admin', 'admin');
                });
            });
        });
    });

    Route::prefix('webhook/payments/')
        ->middleware('checkout.apps.ips')
        ->group(function () {
            Route::controller(PaymentController::class)->group(function () {
                Route::post("/{app_id}", 'updateStatusPayment')->name('webhook.updateStatusPayment');
            });
        });

    Route::get('/mail-metrics/{email_id}/{user_id}', [EmailMarketingMetricsController::class, 'set_opened'])->name('api.email_marketing.set_opened');
});
