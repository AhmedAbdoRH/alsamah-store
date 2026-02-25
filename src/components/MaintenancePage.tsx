import { Helmet } from 'react-helmet-async';
import FacebookButton from './FacebookButton';

const MaintenancePage = () => {
  return (
    <>
      <Helmet>
        <title>الموقع تحت الصيانة | معرض السماح للمفروشات</title>
        <meta name="description" content="معرض السماح للمفروشات - الموقع تحت الصيانة والتطوير. سنكون قريباً مع خدمة أفضل." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div 
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
          fontFamily: 'Cairo, sans-serif'
        }}
      >
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c7a17a' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <img 
              src="/logo.png" 
              alt="معرض السماح للمفروشات" 
              className="mx-auto h-32 w-auto object-contain drop-shadow-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* Fallback text if logo fails to load */}
            <div className="text-4xl font-bold text-white drop-shadow-lg" style={{ display: 'none' }}>
              السماح
            </div>
          </div>

          {/* Maintenance Message */}
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-opacity-20" style={{ borderColor: '#c7a17a' }}>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ color: '#c7a17a' }}>
              الموقع تحت الصيانة
            </h1>
            <p className="text-xl text-gray-200 mb-2">
              نعمل الآن على تحسين وتطوير موقعنا
            </p>
            <p className="text-lg text-gray-300 mb-6">
              لنقدم لكم تجربة أفضل وأكثر احترافية
            </p>
            
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#c7a17a' }}></div>
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#c7a17a', animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: '#c7a17a', animationDelay: '0.4s' }}></div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-xl p-6 mb-8">
            <p className="text-lg text-gray-200 mb-4">
              للتواصل والاستفسارات، تفضلوا بالتواصل معنا عبر:
            </p>
            
            {/* Social Buttons */}
            <div className="flex flex-wrap justify-center items-center gap-4">
              <FacebookButton 
                facebookUrl="https://www.facebook.com/samah.furnitures"
                className="scale-110 transform transition-transform hover:scale-105"
              />
              
              <button 
                className="telegram-button"
                onClick={() => window.open('https://t.me/samah_furnitures', '_blank', 'noopener,noreferrer')}
                type="button"
              >
                <div className="svg-wrapper-1">
                  <div className="svg-wrapper">
                    <svg
                      viewBox="0 0 24 24"
                      height="1.2em"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.35-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                    </svg>
                  </div>
                </div>
                <span>تيليجرام</span>
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              معرض السماح للمفروشات - بنها، أسنيت كفر شكر
            </p>
            <p className="text-gray-500 text-xs mt-2">
              نعتذر عن أي إزعاج ونسعى لخدمتكم بأفضل شكل
            </p>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 rounded-full opacity-20 animate-pulse" style={{ backgroundColor: '#c7a17a' }}></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full opacity-10 animate-pulse" style={{ backgroundColor: '#c7a17a', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 rounded-full opacity-15 animate-pulse" style={{ backgroundColor: '#c7a17a', animationDelay: '0.5s' }}></div>
      </div>
    </>
  );
};

export default MaintenancePage;
